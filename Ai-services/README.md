# AI-Powered Smart City Complaint Intelligence Service

This folder contains a complete hackathon-ready AI/ML microservice for classifying civic complaints, predicting severity, ranking priority, and generating geospatial hotspot zones.

## What it does

- Classifies complaints into civic issue categories such as `pothole`, `garbage`, `water_supply`, `electricity`, `streetlight`, and `drainage`.
- Predicts severity using complaint text, location signals, and historical response behavior.
- Computes a transparent priority score for municipal action.
- Clusters complaint coordinates into civic zones for heatmap generation.
- Exposes FastAPI REST APIs with Swagger docs at `/docs`.
- Ships with a sample dataset, training pipeline, inference pipeline, and analytics for complaint-frequency vs response-gap reporting.

## Project structure

```text
Ai-services/
|-- app/
|   |-- api/routes.py
|   |-- core/analytics.py
|   |-- core/model_manager.py
|   |-- core/predictor.py
|   |-- core/training.py
|   |-- config.py
|   |-- main.py
|   `-- schemas.py
|-- artifacts/
|-- data/
|   |-- README.md
|   `-- sample_complaints.csv
|-- scripts/train_models.py
|-- requirements.txt
`-- README.md
```

## Quick start

```bash
cd Ai-services
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python scripts/train_models.py
uvicorn app.main:app --reload --port 8001
```

Swagger UI: `http://localhost:8001/docs`

ReDoc: `http://localhost:8001/redoc`

## API overview

### `POST /api/v1/predict`

Request:

```json
{
  "complaint_text": "There is a large pothole near the school gate and bikes are skidding.",
  "latitude": 28.6132,
  "longitude": 77.2145,
  "address": "School Road, Ward 12",
  "ward": "Ward 12",
  "image_metadata": {
    "tags": ["road", "pothole", "traffic"],
    "detected_objects": ["motorbike", "crack"],
    "description": "Deep road crater near crossing"
  }
}
```

Response:

```json
{
  "issue_category": "pothole",
  "category_confidence": 0.94,
  "severity_level": "High",
  "severity_confidence": 0.82,
  "priority_score": 78.64,
  "priority_level": "High",
  "cluster_zone": "Zone-2",
  "hotspot_score": 0.86,
  "suggested_department": "Roads and Transport",
  "explanation": {
    "urgency_keyword_hits": 1,
    "historical_zone_load": 0.86,
    "category_response_delay_hours": 23.5,
    "priority_factors": [
      "High severity prediction",
      "Hotspot zone with repeat complaints",
      "Category has slower municipal response history"
    ]
  }
}
```

### `GET /api/v1/analytics/response-gap`

Returns category-wise and zone-wise analytics showing complaint volume, average response times, backlog rate, and a gap score for municipal response planning.

### `GET /api/v1/clusters/heatmap`

Returns zone centroids and individual complaint points to build map heatmaps on the frontend.

### `POST /api/v1/train`

Retrains models from the sample dataset or a custom CSV path.

## Example MERN integration

```js
const response = await fetch("http://localhost:8001/api/v1/predict", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    complaint_text: form.description,
    latitude: form.location.lat,
    longitude: form.location.lng,
    address: form.location.address,
    ward: form.ward,
    image_metadata: {
      tags: form.imageTags,
      description: form.imageCaption,
    },
  }),
});

const aiInsight = await response.json();
```

You can map the response into your existing Mongo complaint fields:

- `issue_category` -> `ai_category`
- `severity_level` -> display badge
- `priority_level` -> `priority_level`
- `priority_score` -> custom sortable field
- `cluster_zone` -> map overlay or ward dashboard

## Explainable AI choices

- `TF-IDF` captures complaint language without needing large-model infrastructure.
- `Logistic Regression` is used for complaint category classification because it is fast, explainable, and strong on sparse text.
- `Gradient Boosting` is used for severity because it works well with mixed text-derived and numeric historical features.
- `KMeans` is used for geospatial zoning because it is lightweight and easy to visualize in a hackathon demo.
- Priority uses a weighted formula so municipal teams can understand why a complaint is ranked higher.

## Dataset expectations

The training CSV should contain:

- `complaint_id`
- `complaint_text`
- `category`
- `severity_level`
- `latitude`
- `longitude`
- `ward`
- `address`
- `image_tags`
- `status`
- `created_at`
- `resolved_at`
- `response_time_hours`

See [data/README.md](/c:/Users/Rudra/OneDrive/Desktop/Smart-City_complaint/Ai-services/data/README.md) and [sample_complaints.csv](/c:/Users/Rudra/OneDrive/Desktop/Smart-City_complaint/Ai-services/data/sample_complaints.csv).

## Deployment notes

- Best for a separate Python service running alongside your Node backend.
- Keep the AI service stateless; retraining writes versioned artifacts into `Ai-services/artifacts`.
- For hackathon deployment, run FastAPI behind Render, Railway, or a small Docker container.
- Enable CORS in FastAPI so the React frontend can call it directly during demos.

## Demo talking points

- Faster triage: complaints are auto-tagged instead of manually sorted.
- Better allocation: response-gap analytics show where the city is under-serving residents.
- Explainability: category, severity, and priority are all backed by understandable factors.
- Real-world civic impact: hotspot clusters can drive ward-level repair campaigns and preventive maintenance.
