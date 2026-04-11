package com.project.terravision.auth.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;

public interface StorageService {
    String uploadFile(String path, String filename, InputStream inputStream, String contentType, long fileSize);
    String uploadFile(String path, MultipartFile file);

    InputStream downloadFile(String objectName);
    InputStream downloadFile(String path, String filename);

    void deleteFile(String path, String filename);
}
