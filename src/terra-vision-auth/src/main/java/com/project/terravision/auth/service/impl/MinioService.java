package com.project.terravision.auth.service.impl;

import com.project.terravision.auth.config.properties.MinioProperties;
import io.minio.*;
import io.minio.errors.MinioException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
@RequiredArgsConstructor
public class MinioService {

    private final MinioClient minioClient;
    private final MinioProperties minioProperties;

    public String uploadFile(
            String path,
            String filename,
            InputStream inputStream,
            String contentType,
            long fileSize
    ) {
        String objectName = buildObjectName(path, filename);
        try {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(minioProperties.getBucket())
                    .object(objectName)
                    .stream(inputStream, fileSize, -1L)
                    .contentType(contentType)
                    .build());

            return objectName;
        } catch (MinioException ex) {
            throw new RuntimeException(ex);
        }
    }

    public String uploadFile(String path, MultipartFile file) {
        String filename = StringUtils.getFilename(file.getOriginalFilename());
        try {
            return uploadFile(
                    path,
                    filename,
                    file.getInputStream(),
                    file.getContentType(),
                    file.getSize()
            );
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
    }

    public InputStream downloadFile(String objectName) {
        try {
            return minioClient.getObject(GetObjectArgs.builder()
                    .bucket(minioProperties.getBucket())
                    .object(objectName)
                    .build());
        } catch (MinioException ex) {
            throw new RuntimeException(ex);
        }
    }

    public InputStream downloadFile(String path, String filename) {
        String objectName = buildObjectName(path, filename);
        return downloadFile(objectName);
    }

    public void deleteFile(String path, String filename) {
        String objectName = buildObjectName(path, filename);
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(minioProperties.getBucket())
                    .object(objectName)
                    .build());
        } catch (MinioException ex) {
            throw new RuntimeException(ex);
        }
    }

    // ------------ private methods ------------

    private String buildObjectName(String path, String filename) {
        path = normalizePath(path);
        return path.endsWith("/")
                ? path + filename
                : path + "/" + filename;
    }

    private String normalizePath(String path) {
        return path.startsWith("/")
                ? path.substring(1)
                : path;
    }

}
