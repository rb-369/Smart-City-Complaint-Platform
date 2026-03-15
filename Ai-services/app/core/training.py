from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any
import math
import os

os.environ.setdefault("LOKY_MAX_CPU_COUNT", "1")

import joblib
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.compose import ColumnTransformer
from sklearn.decomposition import TruncatedSVD
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from app.config import (
    CATEGORY_MODEL_PATH,
    CLUSTER_MODEL_PATH,
    DEFAULT_DATASET_PATH,
    METADATA_PATH,
    SEVERITY_MODEL_PATH,
)
from app.core.analytics import build_heatmap_points, build_response_gap_report

REQUIRED_COLUMNS = {
    "complaint_id",
    "complaint_text",
    "category",
    "severity_level",
    "latitude",
    "longitude",
    "ward",
    "address",
    "image_tags",
    "status",
    "created_at",
    "resolved_at",
    "response_time_hours",
}

URGENCY_KEYWORDS = {
    "accident",
    "ambulance",
    "burst",
    "critical",
    "danger",
    "dark",
    "emergency",
    "flooded",
    "hazard",
    "hospital",
    "injury",
    "leak",
    "mosquito",
    "outage",
    "overflow",
    "sewage",
    "skid",
    "sparking",
    "unsafe",
}

DEPARTMENT_MAP = {
    "pothole": "Roads and Transport",
    "garbage": "Solid Waste Management",
    "water_supply": "Water Supply Department",
    "electricity": "Power and Utilities",
    "streetlight": "Electrical Maintenance",
    "drainage": "Drainage and Sewerage",
}

CATEGORY_RISK_WEIGHTS = {
    "pothole": 0.72,
    "garbage": 0.54,
    "water_supply": 0.78,
    "electricity": 0.84,
    "streetlight": 0.48,
    "drainage": 0.76,
}


def train_and_save_models(dataset_path: str | Path | None = None) -> dict[str, Any]:
    resolved_dataset = Path(dataset_path or DEFAULT_DATASET_PATH).resolve()
    df = load_dataset(resolved_dataset)
    df = enrich_dataset(df)

    cluster_model, df, zone_profiles = fit_cluster_model(df)

    category_profiles = build_group_profiles(df, "category")
    ward_profiles = build_group_profiles(df, "ward")
    df = attach_historical_features(df, category_profiles, ward_profiles, zone_profiles)

    category_model, category_accuracy = fit_category_model(df)
    severity_model, severity_accuracy = fit_severity_model(df)

    analytics = build_response_gap_report(df)
    heatmap_points = build_heatmap_points(df, zone_profiles)

    metadata = {
        "model_version": datetime.utcnow().strftime("%Y%m%d%H%M%S"),
        "trained_at_utc": datetime.utcnow().isoformat(),
        "dataset_path": str(resolved_dataset),
        "training_rows": int(len(df)),
        "categories": sorted(df["category"].unique().tolist()),
        "severity_levels": sorted(df["severity_level"].unique().tolist()),
        "department_map": DEPARTMENT_MAP,
        "category_risk_weights": CATEGORY_RISK_WEIGHTS,
        "category_profiles": category_profiles,
        "ward_profiles": ward_profiles,
        "zone_profiles": zone_profiles,
        "training_metrics": {
            "category_accuracy": round(category_accuracy, 4),
            "severity_accuracy": round(severity_accuracy, 4),
            "validation_strategy": validation_strategy(df),
        },
        "response_gap_report": analytics,
        "heatmap_points": heatmap_points,
        "feature_columns": {
            "category_numeric": category_numeric_columns(),
            "severity_numeric": severity_numeric_columns(),
        },
    }

    joblib.dump(category_model, CATEGORY_MODEL_PATH)
    joblib.dump(severity_model, SEVERITY_MODEL_PATH)
    joblib.dump(cluster_model, CLUSTER_MODEL_PATH)
    joblib.dump(metadata, METADATA_PATH)

    return {
        "dataset_path": str(resolved_dataset),
        "training_rows": metadata["training_rows"],
        "categories": metadata["categories"],
        "severity_levels": metadata["severity_levels"],
        "zones": sorted(zone_profiles.keys()),
        "training_metrics": metadata["training_metrics"],
        "artifacts": {
            "category_model": str(CATEGORY_MODEL_PATH),
            "severity_model": str(SEVERITY_MODEL_PATH),
            "cluster_model": str(CLUSTER_MODEL_PATH),
            "metadata": str(METADATA_PATH),
        },
    }


def load_dataset(dataset_path: Path) -> pd.DataFrame:
    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset not found: {dataset_path}")

    df = pd.read_csv(dataset_path)
    missing = REQUIRED_COLUMNS.difference(df.columns)
    if missing:
        raise ValueError(f"Dataset is missing required columns: {sorted(missing)}")

    return df


def enrich_dataset(df: pd.DataFrame) -> pd.DataFrame:
    working = df.copy()

    for text_column in ["complaint_text", "ward", "address", "image_tags", "status", "category", "severity_level"]:
        working[text_column] = working[text_column].fillna("").astype(str)

    for numeric_column in ["latitude", "longitude", "response_time_hours"]:
        working[numeric_column] = pd.to_numeric(working[numeric_column], errors="coerce")

    created = pd.to_datetime(working["created_at"], errors="coerce")
    resolved = pd.to_datetime(working["resolved_at"], errors="coerce")
    derived_hours = (resolved - created).dt.total_seconds() / 3600

    working["response_time_hours"] = working["response_time_hours"].fillna(derived_hours)
    working["response_time_hours"] = working["response_time_hours"].fillna(
        working["response_time_hours"].median()
    )
    working["response_time_hours"] = working["response_time_hours"].clip(lower=1)
    working["latitude"] = working["latitude"].fillna(working["latitude"].median())
    working["longitude"] = working["longitude"].fillna(working["longitude"].median())

    working["complaint_text"] = working["complaint_text"].str.strip()
    working["combined_text"] = (
        working["complaint_text"]
        + " ward "
        + working["ward"]
        + " address "
        + working["address"]
        + " image "
        + working["image_tags"]
    )
    working["text_length"] = working["complaint_text"].str.split().str.len().fillna(0).clip(lower=1)
    working["urgency_keyword_hits"] = working["combined_text"].apply(count_urgency_keywords)

    return working


def fit_cluster_model(df: pd.DataFrame) -> tuple[KMeans, pd.DataFrame, dict[str, dict[str, Any]]]:
    working = df.copy()
    coords = working[["latitude", "longitude"]]
    unique_points = len(coords.drop_duplicates())
    n_clusters = max(2, min(6, int(round(math.sqrt(max(unique_points, 4) / 2)))))
    n_clusters = min(n_clusters, max(1, unique_points))

    cluster_model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    cluster_ids = cluster_model.fit_predict(coords)
    working["cluster_zone"] = [f"Zone-{cluster_id + 1}" for cluster_id in cluster_ids]

    counts = working["cluster_zone"].value_counts().to_dict()
    max_count = max(counts.values()) if counts else 1

    zone_profiles: dict[str, dict[str, Any]] = {}
    for cluster_zone, subset in working.groupby("cluster_zone"):
        centroid = {
            "latitude": round(float(subset["latitude"].mean()), 6),
            "longitude": round(float(subset["longitude"].mean()), 6),
        }
        zone_profiles[cluster_zone] = {
            "complaint_volume": int(len(subset)),
            "hotspot_score": round(len(subset) / max_count, 3),
            "avg_response_hours": round(float(subset["response_time_hours"].mean()), 2),
            "avg_severity_score": round(float(subset["severity_level"].map(score_label).mean()), 2),
            "open_ratio": round(
                float((subset["status"].str.lower() != "resolved").mean()),
                3,
            ),
            "centroid": centroid,
        }

    return cluster_model, working, zone_profiles


def build_group_profiles(df: pd.DataFrame, group_column: str) -> dict[str, dict[str, Any]]:
    profiles: dict[str, dict[str, Any]] = {}
    max_volume = max(int(df[group_column].value_counts().max()), 1)

    for group_value, subset in df.groupby(group_column):
        profiles[str(group_value)] = {
            "complaint_volume": int(len(subset)),
            "normalized_volume": round(len(subset) / max_volume, 3),
            "avg_response_hours": round(float(subset["response_time_hours"].mean()), 2),
            "avg_severity_score": round(float(subset["severity_level"].map(score_label).mean()), 2),
            "open_ratio": round(
                float((subset["status"].str.lower() != "resolved").mean()),
                3,
            ),
        }

    return profiles


def attach_historical_features(
    df: pd.DataFrame,
    category_profiles: dict[str, dict[str, Any]],
    ward_profiles: dict[str, dict[str, Any]],
    zone_profiles: dict[str, dict[str, Any]],
) -> pd.DataFrame:
    working = df.copy()

    global_response = float(working["response_time_hours"].mean())
    global_volume = float(len(working))

    working["category_avg_response"] = working["category"].map(
        lambda value: category_profiles.get(value, {}).get("avg_response_hours", global_response)
    )
    working["category_volume"] = working["category"].map(
        lambda value: category_profiles.get(value, {}).get("complaint_volume", global_volume)
    )
    working["ward_frequency"] = working["ward"].map(
        lambda value: ward_profiles.get(value, {}).get("complaint_volume", 1)
    )
    working["ward_avg_response"] = working["ward"].map(
        lambda value: ward_profiles.get(value, {}).get("avg_response_hours", global_response)
    )
    working["zone_frequency"] = working["cluster_zone"].map(
        lambda value: zone_profiles.get(value, {}).get("complaint_volume", 1)
    )
    working["zone_avg_response"] = working["cluster_zone"].map(
        lambda value: zone_profiles.get(value, {}).get("avg_response_hours", global_response)
    )
    working["zone_hotspot_score"] = working["cluster_zone"].map(
        lambda value: zone_profiles.get(value, {}).get("hotspot_score", 0.5)
    )
    working["zone_open_ratio"] = working["cluster_zone"].map(
        lambda value: zone_profiles.get(value, {}).get("open_ratio", 0.0)
    )
    working["severity_text"] = working["combined_text"] + " category " + working["category"]

    return working


def fit_category_model(df: pd.DataFrame) -> tuple[Pipeline, float]:
    feature_columns = ["combined_text", *category_numeric_columns()]
    X = df[feature_columns]
    y = df["category"]

    model = Pipeline(
        steps=[
            (
                "features",
                ColumnTransformer(
                    transformers=[
                        (
                            "text",
                            TfidfVectorizer(stop_words="english", ngram_range=(1, 2), max_features=3000),
                            "combined_text",
                        ),
                        (
                            "numeric",
                            StandardScaler(with_mean=False),
                            category_numeric_columns(),
                        ),
                    ]
                ),
            ),
            (
                "classifier",
                LogisticRegression(
                    max_iter=5000,
                    class_weight="balanced",
                    solver="lbfgs",
                ),
            ),
        ]
    )

    accuracy = evaluate_model(model, X, y)
    model.fit(X, y)
    return model, accuracy


def fit_severity_model(df: pd.DataFrame) -> tuple[Pipeline, float]:
    feature_columns = ["severity_text", *severity_numeric_columns()]
    X = df[feature_columns]
    y = df["severity_level"]

    svd_components = min(25, max(4, len(df) - 2))

    model = Pipeline(
        steps=[
            (
                "features",
                ColumnTransformer(
                    transformers=[
                        (
                            "text",
                            Pipeline(
                                steps=[
                                    (
                                        "tfidf",
                                        TfidfVectorizer(
                                            stop_words="english",
                                            ngram_range=(1, 2),
                                            max_features=2500,
                                        ),
                                    ),
                                    ("svd", TruncatedSVD(n_components=svd_components, random_state=42)),
                                ]
                            ),
                            "severity_text",
                        ),
                        ("numeric", StandardScaler(), severity_numeric_columns()),
                    ]
                ),
            ),
            ("classifier", GradientBoostingClassifier(random_state=42)),
        ]
    )

    accuracy = evaluate_model(model, X, y)
    model.fit(X, y)
    return model, accuracy


def evaluate_model(model: Pipeline, X: pd.DataFrame, y: pd.Series) -> float:
    if len(X) < 60 or len(pd.Series(y).unique()) < 2 or int(pd.Series(y).value_counts().min()) < 3:
        model.fit(X, y)
        return accuracy_score(y, model.predict(X))

    value_counts = pd.Series(y).value_counts()
    stratify = y if int(value_counts.min()) > 1 else None
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=stratify,
    )
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    return accuracy_score(y_test, predictions)


def validation_strategy(df: pd.DataFrame) -> str:
    if len(df) < 60:
        return "resubstitution_accuracy_on_demo_dataset"
    return "holdout_accuracy_80_20_split"


def category_numeric_columns() -> list[str]:
    return ["latitude", "longitude", "text_length", "urgency_keyword_hits"]


def severity_numeric_columns() -> list[str]:
    return [
        "latitude",
        "longitude",
        "text_length",
        "urgency_keyword_hits",
        "category_avg_response",
        "category_volume",
        "ward_frequency",
        "ward_avg_response",
        "zone_frequency",
        "zone_avg_response",
        "zone_hotspot_score",
        "zone_open_ratio",
    ]


def count_urgency_keywords(text: str) -> int:
    lowered = text.lower()
    return sum(1 for keyword in URGENCY_KEYWORDS if keyword in lowered)


def score_label(label: str) -> int:
    return {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}.get(label, 2)
