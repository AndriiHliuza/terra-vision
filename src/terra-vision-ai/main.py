from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from config import ORIGINS
from routers import models_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(models_router, prefix="/api/ai", tags=["models"])
