#!/bin/sh

mc alias set terra-vision-minio http://terra-vision-minio:9000 $TERRA_VISION__MINIO__ROOT_USER $TERRA_VISION__MINIO__ROOT_PASSWORD

mc mb --ignore-existing terra-vision-minio/terra-vision-auth-bucket
mc mb --ignore-existing terra-vision-minio/terra-vision-ai-bucket
mc mb --ignore-existing terra-vision-minio/terra-vision-gis-bucket

echo "Buckets created successfully"