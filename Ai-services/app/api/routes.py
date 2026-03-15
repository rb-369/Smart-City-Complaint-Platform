from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.core.model_manager import model_manager
from app.core.predictor import predictor
from app.schemas import ComplaintRequest, PredictionResponse, TrainRequest, TrainResponse

router = APIRouter(prefix="/api/v1")


@router.get("/health", tags=["System"])
def healthcheck() -> dict[str, str]:
    return {"status": "ok", "service": "smart-city-ai"}


@router.get("/model-info", tags=["System"])
def model_info() -> dict:
    return predictor.get_model_info()


@router.post("/predict", response_model=PredictionResponse, tags=["Inference"])
def predict_complaint(payload: ComplaintRequest) -> PredictionResponse:
    try:
        return PredictionResponse(**predictor.predict(payload))
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/train", response_model=TrainResponse, tags=["Training"])
def train_models(request: TrainRequest) -> TrainResponse:
    try:
        summary = model_manager.train(request.dataset_path)
        return TrainResponse(
            message="Training completed successfully",
            dataset_path=summary["dataset_path"],
            training_summary=summary,
        )
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/analytics/response-gap", tags=["Analytics"])
def response_gap() -> dict:
    return predictor.get_response_gap()


@router.get("/clusters/heatmap", tags=["Analytics"])
def heatmap() -> dict:
    return predictor.get_heatmap()
