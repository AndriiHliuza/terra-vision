package com.project.terravision.gis.service.impl;

import com.project.terravision.gis.config.properties.MinioProperties;
import com.project.terravision.gis.service.StorageService;
import io.minio.*;
import io.minio.errors.MinioException;
import io.minio.messages.Item;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MinioService implements StorageService {

    private final MinioClient minioClient;
    private final MinioProperties minioProperties;

    @Override
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

    @Override
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

    @Override
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

    @Override
    public InputStream downloadFile(String path, String filename) {
        String objectName = buildObjectName(path, filename);
        return downloadFile(objectName);
    }

    @Override
    public List<InputStream> downloadFiles(String path, int pageNumber, int pageSize) {
        try {
            Iterable<Result<Item>> results = minioClient.listObjects(ListObjectsArgs.builder()
                    .bucket(minioProperties.getBucket())
                    .prefix(path)
                    .build());

            List<String> objectNames = new ArrayList<>();
            for (Result<Item> result : results) {
                objectNames.add(result.get().objectName());
            }

            Collections.sort(objectNames);

            int skip = pageNumber * pageSize;
            int to = Math.min(skip + pageSize, objectNames.size());

            if (skip >= objectNames.size()) return List.of();

            return objectNames.subList(skip, to).stream()
                    .map(this::downloadFile)
                    .toList();

        } catch(MinioException ex) {
            throw new RuntimeException(ex);
        }

    }

    @Override
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