package com.project.terravision.auth.service;

import com.project.terravision.auth.dto.SessionDetails;

import java.util.List;

public interface SessionService {
    void saveSession(String userId, String jti, SessionDetails sessionDetails);
    void revokeSession(String userId, String jti);
    void revokeAllSessions(String userId);
    void updateLastUsed(String userId, String jti);
    boolean isValidSession(String userId, String jti);
    SessionDetails getSession(String userId, String jti);
    List<SessionDetails> getAllSessions(String userId);
}
