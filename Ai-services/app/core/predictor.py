from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd

from app.core.model_manager import model_manager
from app.core.training import count_urgency_keywords
from app.schemas import ComplaintRequest


class ComplaintPredictor:
    def __init__(self) -> None:
        self.manager = model_manager

    def predict(self, payload: ComplaintRequest) -> dict[str, Any]:
        bundle = self.manager.get_bundle()
        metadata = bundle["metadata"]
        category_model = bundle["category_model"]
        severity_model = bundle["severity_model"]
        cluster_model = bundle["cluster_model"]

        base_row = self._build_base_row(payload)
        cluster_zone, zone_profile = self._predict_cluster(cluster_model, metadata, base_row)

        category_input = pd.DataFrame(
            [
                {
                    "combined_text": base_row["combined_text"],
                    "latitude": base_row["latitude"],
                    "longitude": base_row["longitude"],
                    "text_length": base_row["text_length"],
                    "urgency_keyword_hits": base_row["urgency_keyword_hits"],
                }
            ]
        )
        category_prediction = category_model.predict(category_input)[0]
        category_probabilities = category_model.predict_proba(category_input)[0]
        category_labels = list(category_model.classes_)
        category_confidence = float(np.max(category_probabilities))

        category_profile = metadata["category_profiles"].get(category_prediction, {})
        ward_profile = metadata["ward_profiles"].get(base_row["ward"], {})

        severity_input = pd.DataFrame(
            [
                {
                    "severity_text": base_row["combined_text"] + " category " + category_prediction,
                    "latitude": base_row["latitude"],
                    "longitude": base_row["longitude"],
                    "text_length": base_row["text_length"],
                    "urgency_keyword_hits": base_row["urgency_keyword_hits"],
                    "category_avg_response": category_profile.get("avg_response_hours", 24.0),
                    "category_volume": category_profile.get("complaint_volume", 1),
                    "ward_frequency": ward_profile.get("complaint_volume", 1),
                    "ward_avg_response": ward_profile.get("avg_response_hours", 24.0),
                    "zone_frequency": zone_profile.get("complaint_volume", 1),
                    "zone_avg_response": zone_profile.get("avg_response_hours", 24.0),
                    "zone_hotspot_score": zone_profile.get("hotspot_score", 0.0),
                    "zone_open_ratio": zone_profile.get("open_ratio", 0.0),
                }
            ]
        )
        severity_prediction = severity_model.predict(severity_input)[0]
        severity_probabilities = severity_model.predict_proba(severity_input)[0]
        severity_confidence = float(np.max(severity_probabilities))

        priority_score, priority_level, factors = self._compute_priority(
            metadata,
            category_prediction,
            severity_prediction,
            zone_profile,
            base_row["has_image_metadata"],
            base_row["urgency_keyword_hits"],
        )

        return {
            "issue_category": category_prediction,
            "category_confidence": round(category_confidence, 3),
            "severity_level": severity_prediction,
            "severity_confidence": round(severity_confidence, 3),
            "priority_score": round(priority_score, 2),
            "priority_level": priority_level,
            "cluster_zone": cluster_zone,
            "hotspot_score": round(float(zone_profile.get("hotspot_score", 0.0)), 3),
            "suggested_department": metadata["department_map"].get(category_prediction, "Municipal Control Room"),
            "explanation": {
                "urgency_keyword_hits": base_row["urgency_keyword_hits"],
                "historical_zone_load": round(float(zone_profile.get("hotspot_score", 0.0)), 3),
                "category_response_delay_hours": round(
                    float(category_profile.get("avg_response_hours", 24.0)),
                    2,
                ),
                "top_candidate_categories": [
                    {
                        "label": label,
                        "confidence": round(float(score), 3),
                    }
                    for label, score in sorted(
                        zip(category_labels, category_probabilities),
                        key=lambda item: item[1],
                        reverse=True,
                    )[:3]
                ],
                "priority_factors": factors,
            },
            "model_version": metadata["model_version"],
        }

    def get_model_info(self) -> dict[str, Any]:
        metadata = self.manager.get_bundle()["metadata"]
        return {
            "model_version": metadata["model_version"],
            "trained_at_utc": metadata["trained_at_utc"],
            "training_rows": metadata["training_rows"],
            "categories": metadata["categories"],
            "severity_levels": metadata["severity_levels"],
            "training_metrics": metadata["training_metrics"],
        }

    def get_heatmap(self) -> dict[str, Any]:
        metadata = self.manager.get_bundle()["metadata"]
        zones = [
            {
                "cluster_zone": zone,
                **profile,
            }
            for zone, profile in sorted(metadata["zone_profiles"].items())
        ]
        return {
            "zones": zones,
            "points": metadata["heatmap_points"],
        }

    def get_response_gap(self) -> dict[str, Any]:
        metadata = self.manager.get_bundle()["metadata"]
        return metadata["response_gap_report"]

    def _build_base_row(self, payload: ComplaintRequest) -> dict[str, Any]:
        image_metadata = payload.image_metadata
        image_tokens: list[str] = []
        has_image_metadata = False

        if image_metadata:
            has_image_metadata = bool(
                image_metadata.tags
                or image_metadata.detected_objects
                or image_metadata.description
            )
            image_tokens.extend(image_metadata.tags)
            image_tokens.extend(image_metadata.detected_objects)
            if image_metadata.description:
                image_tokens.append(image_metadata.description)

        ward = payload.ward or "Unknown Ward"
        address = payload.address or "Unknown Address"
        image_summary = " ".join(image_tokens)
        combined_text = (
            f"{payload.complaint_text} ward {ward} address {address} image {image_summary}".strip()
        )

        return {
            "combined_text": combined_text,
            "latitude": payload.latitude,
            "longitude": payload.longitude,
            "ward": ward,
            "text_length": max(len(payload.complaint_text.split()), 1),
            "urgency_keyword_hits": count_urgency_keywords(combined_text),
            "has_image_metadata": has_image_metadata,
        }

    def _predict_cluster(
        self,
        cluster_model: Any,
        metadata: dict[str, Any],
        base_row: dict[str, Any],
    ) -> tuple[str, dict[str, Any]]:
        cluster_input = pd.DataFrame(
            [{"latitude": base_row["latitude"], "longitude": base_row["longitude"]}]
        )
        cluster_index = int(cluster_model.predict(cluster_input)[0])
        cluster_zone = f"Zone-{cluster_index + 1}"
        zone_profile = metadata["zone_profiles"].get(cluster_zone, {})
        return cluster_zone, zone_profile

    def _compute_priority(
        self,
        metadata: dict[str, Any],
        category: str,
        severity: str,
        zone_profile: dict[str, Any],
        has_image_metadata: bool,
        urgency_keyword_hits: int,
    ) -> tuple[float, str, list[str]]:
        severity_signal = {
            "Low": 0.25,
            "Medium": 0.5,
            "High": 0.75,
            "Critical": 1.0,
        }.get(severity, 0.5)
        category_signal = metadata["category_risk_weights"].get(category, 0.5)
        hotspot_signal = float(zone_profile.get("hotspot_score", 0.0))
        backlog_signal = float(zone_profile.get("open_ratio", 0.0))
        delay_signal = min(float(zone_profile.get("avg_response_hours", 24.0)) / 48.0, 1.0)
        evidence_signal = min(0.2 + (0.2 if has_image_metadata else 0.0) + (0.05 * urgency_keyword_hits), 1.0)

        priority_score = 100 * (
            0.38 * severity_signal
            + 0.18 * category_signal
            + 0.16 * hotspot_signal
            + 0.14 * backlog_signal
            + 0.08 * delay_signal
            + 0.06 * evidence_signal
        )

        if priority_score >= 80:
            priority_level = "Critical"
        elif priority_score >= 65:
            priority_level = "High"
        elif priority_score >= 45:
            priority_level = "Medium"
        else:
            priority_level = "Low"

        factors: list[str] = []
        if severity in {"High", "Critical"}:
            factors.append(f"{severity} severity prediction")
        if hotspot_signal >= 0.7:
            factors.append("Hotspot zone with repeat complaints")
        if backlog_signal >= 0.3:
            factors.append("Area has unresolved municipal backlog")
        if has_image_metadata:
            factors.append("Image metadata strengthened evidence quality")
        if urgency_keyword_hits > 0:
            factors.append("Complaint text contains urgency indicators")
        if not factors:
            factors.append("Moderate civic impact with standard response urgency")

        return priority_score, priority_level, factors


predictor = ComplaintPredictor()
