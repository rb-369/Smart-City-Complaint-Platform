from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ImageMetadata(BaseModel):
    file_name: str | None = Field(default=None, description="Optional uploaded file name")
    mime_type: str | None = Field(default=None, description="Optional mime type")
    tags: list[str] = Field(default_factory=list, description="Optional image labels or OCR tags")
    detected_objects: list[str] = Field(default_factory=list, description="Optional vision detections")
    description: str | None = Field(default=None, description="Optional manual or AI image caption")


class ComplaintRequest(BaseModel):
    complaint_text: str = Field(
        ...,
        min_length=5,
        description="Citizen complaint text",
        examples=["There is a large pothole near the school and it is causing accidents."],
    )
    latitude: float = Field(..., description="Complaint latitude", examples=[28.6139])
    longitude: float = Field(..., description="Complaint longitude", examples=[77.2090])
    address: str | None = Field(default=None, description="Address or landmark")
    ward: str | None = Field(default=None, description="Ward or locality name")
    created_at: datetime | None = Field(default=None, description="Optional complaint creation time")
    image_metadata: ImageMetadata | None = Field(default=None, description="Optional image metadata only")

    model_config = {
        "json_schema_extra": {
            "example": {
                "complaint_text": "Garbage has not been picked up for three days near the park gate.",
                "latitude": 28.6124,
                "longitude": 77.2276,
                "address": "Senior Citizen Center",
                "ward": "Ward 16",
                "image_metadata": {
                    "tags": ["garbage", "waste", "park"],
                    "detected_objects": ["bin", "plastic_bag"],
                    "description": "Overflowing roadside garbage pile",
                },
            }
        }
    }


class PredictionResponse(BaseModel):
    issue_category: str
    category_confidence: float
    severity_level: str
    severity_confidence: float
    priority_score: float
    priority_level: str
    cluster_zone: str
    hotspot_score: float
    suggested_department: str
    explanation: dict[str, Any]
    model_version: str


class TrainRequest(BaseModel):
    dataset_path: str | None = Field(
        default=None,
        description="Optional custom dataset path. Defaults to Ai-services/data/sample_complaints.csv",
    )


class TrainResponse(BaseModel):
    message: str
    dataset_path: str
    training_summary: dict[str, Any]
