from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.emergency import router as emergency_router

app = FastAPI(title="RapidCare API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(emergency_router)
