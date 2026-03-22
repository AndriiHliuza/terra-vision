from fastapi import FastAPI

from config.logging_config import configure_logging
from router import model_router, detection_router, stats_router, storage_router

configure_logging()
app = FastAPI()
app.include_router(model_router, prefix="/api/ai")
app.include_router(detection_router, prefix="/api/ai")
app.include_router(stats_router, prefix="/api/ai")
app.include_router(storage_router, prefix="/api/ai")
