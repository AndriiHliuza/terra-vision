from minio import Minio
from config.vault_config import VAULT_SECRETS


MINIO_HOST = "localhost"
MINIO_PORT = "9000"
MINIO_ENDPOINT = f"{MINIO_HOST}:{MINIO_PORT}"
MINIO_ACCESS_KEY = VAULT_SECRETS.get("TERRA_VISION__MINIO__ROOT_USER")
MINIO_SECRET_KEY = VAULT_SECRETS.get("TERRA_VISION__MINIO__ROOT_PASSWORD")
MINIO_SECURE = False # Use https or http. If False -> uses http
MINIO_BUCKET_NAME = "terra-vision-ai-bucket"

MINIO_CLIENT = Minio(
    endpoint=MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=MINIO_SECURE
)