from fastapi import FastAPI
from routers import cv_router

app = FastAPI()
app.include_router(cv_router, prefix="/api/ai")
