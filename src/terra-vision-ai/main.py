from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from config import ORIGINS
from routers import model_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(model_router, prefix="/api/ai", tags=["models"])
