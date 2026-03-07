package com.project.terravision.auth.service;

public interface EmailService {
    void sendVerificationEmail(String to, String username, String token);
}
