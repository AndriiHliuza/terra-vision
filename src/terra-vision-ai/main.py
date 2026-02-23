from fastapi import FastAPI
from router import cv_model_router, cv_processing_router

app = FastAPI()
app.include_router(cv_model_router, prefix="/api/ai")
app.include_router(cv_processing_router, prefix="/api/ai")
