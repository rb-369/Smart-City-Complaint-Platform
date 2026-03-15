from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router

app = FastAPI(
    title="Smart City Complaint AI Service",
    version="1.0.0",
    description=(
        "Hackathon-ready AI microservice for complaint classification, severity prediction, "
        "priority scoring, and hotspot clustering."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/", tags=["System"])
def root() -> dict[str, str]:
    return {
        "message": "Smart City Complaint AI Service is running",
        "docs": "/docs",
    }
