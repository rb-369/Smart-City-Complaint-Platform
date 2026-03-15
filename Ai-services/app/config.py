from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
ARTIFACT_DIR = BASE_DIR / "artifacts"
DATA_DIR = BASE_DIR / "data"
DEFAULT_DATASET_PATH = DATA_DIR / "sample_complaints.csv"

CATEGORY_MODEL_PATH = ARTIFACT_DIR / "category_model.joblib"
SEVERITY_MODEL_PATH = ARTIFACT_DIR / "severity_model.joblib"
CLUSTER_MODEL_PATH = ARTIFACT_DIR / "cluster_model.joblib"
METADATA_PATH = ARTIFACT_DIR / "metadata.joblib"

ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)
