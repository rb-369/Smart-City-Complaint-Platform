from __future__ import annotations

from typing import Any

import joblib

from app.config import (
    CATEGORY_MODEL_PATH,
    CLUSTER_MODEL_PATH,
    DEFAULT_DATASET_PATH,
    METADATA_PATH,
    SEVERITY_MODEL_PATH,
)
from app.core.training import train_and_save_models


class ModelManager:
    def __init__(self) -> None:
        self._bundle: dict[str, Any] | None = None

    def get_bundle(self) -> dict[str, Any]:
        if self._bundle is None:
            self._bundle = self._load_or_train()
        return self._bundle

    def reload(self) -> dict[str, Any]:
        self._bundle = self._load_or_train(force_reload=True)
        return self._bundle

    def train(self, dataset_path: str | None = None) -> dict[str, Any]:
        summary = train_and_save_models(dataset_path or DEFAULT_DATASET_PATH)
        self.reload()
        return summary

    def _load_or_train(self, force_reload: bool = False) -> dict[str, Any]:
        required_files = [
            CATEGORY_MODEL_PATH,
            SEVERITY_MODEL_PATH,
            CLUSTER_MODEL_PATH,
            METADATA_PATH,
        ]

        if force_reload or not all(path.exists() for path in required_files):
            train_and_save_models(DEFAULT_DATASET_PATH)

        return {
            "category_model": joblib.load(CATEGORY_MODEL_PATH),
            "severity_model": joblib.load(SEVERITY_MODEL_PATH),
            "cluster_model": joblib.load(CLUSTER_MODEL_PATH),
            "metadata": joblib.load(METADATA_PATH),
        }


model_manager = ModelManager()
