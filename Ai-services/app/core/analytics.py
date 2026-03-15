from __future__ import annotations

from typing import Any

import pandas as pd

SEVERITY_SCORES = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}


def build_response_gap_report(df: pd.DataFrame) -> dict[str, list[dict[str, Any]]]:
    working = df.copy()
    working["severity_score"] = working["severity_level"].map(SEVERITY_SCORES).fillna(2)
    working["response_time_hours"] = working["response_time_hours"].fillna(
        working["response_time_hours"].median()
    )
    working["is_resolved"] = (working["status"].fillna("").str.lower() == "resolved").astype(int)

    category_report = _aggregate_gap_report(working, "category")
    zone_report = _aggregate_gap_report(working, "cluster_zone")

    return {
        "by_category": category_report,
        "by_zone": zone_report,
    }


def build_heatmap_points(df: pd.DataFrame, zone_profiles: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    points: list[dict[str, Any]] = []
    for row in df.to_dict(orient="records"):
        zone = row["cluster_zone"]
        zone_profile = zone_profiles.get(zone, {})
        points.append(
            {
                "complaint_id": row["complaint_id"],
                "latitude": round(float(row["latitude"]), 6),
                "longitude": round(float(row["longitude"]), 6),
                "category": row["category"],
                "severity_level": row["severity_level"],
                "cluster_zone": zone,
                "hotspot_score": zone_profile.get("hotspot_score", 0.0),
            }
        )
    return points


def _aggregate_gap_report(df: pd.DataFrame, group_column: str) -> list[dict[str, Any]]:
    grouped = (
        df.groupby(group_column, dropna=False)
        .agg(
            complaint_volume=("complaint_id", "count"),
            resolved_count=("is_resolved", "sum"),
            avg_response_hours=("response_time_hours", "mean"),
            avg_severity_score=("severity_score", "mean"),
        )
        .reset_index()
    )

    max_volume = max(float(grouped["complaint_volume"].max()), 1.0)
    max_response = max(float(grouped["avg_response_hours"].max()), 1.0)

    report: list[dict[str, Any]] = []
    for row in grouped.to_dict(orient="records"):
        complaint_volume = float(row["complaint_volume"])
        resolved_count = float(row["resolved_count"])
        response_hours = float(row["avg_response_hours"])
        severity_score = float(row["avg_severity_score"])
        resolution_rate = resolved_count / complaint_volume if complaint_volume else 0.0
        backlog_rate = 1.0 - resolution_rate

        service_gap = 100 * (
            0.45 * (complaint_volume / max_volume)
            + 0.35 * (response_hours / max_response)
            + 0.20 * backlog_rate
        )

        report.append(
            {
                "name": row[group_column],
                "complaint_volume": int(complaint_volume),
                "resolved_count": int(resolved_count),
                "resolution_rate": round(resolution_rate, 3),
                "backlog_rate": round(backlog_rate, 3),
                "avg_response_hours": round(response_hours, 2),
                "avg_severity_score": round(severity_score, 2),
                "service_gap_score": round(service_gap, 2),
                "skill_gap_score": round(service_gap, 2),
            }
        )

    report.sort(key=lambda item: item["service_gap_score"], reverse=True)
    return report
