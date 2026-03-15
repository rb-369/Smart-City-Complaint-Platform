from pathlib import Path
import sys

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.core.training import train_and_save_models


if __name__ == "__main__":
    summary = train_and_save_models()
    print("Training completed")
    print(summary)
