from fastapi import APIRouter, Form, UploadFile, File
from starlette.responses import StreamingResponse

from service.detection_service import DETECTION_SERVICE

router = APIRouter()

@router.post("/detect")
async def detect(
        user_id: str = Form(None),
        model_id: str = Form(...),
        confidence: float = Form(0.25),
        archives: list[UploadFile] = File(...)
) -> StreamingResponse:
    return await DETECTION_SERVICE.detect_objects(user_id, model_id, confidence, archives)
