package com.project.terravision.auth.service;

import com.project.terravision.auth.dto.SessionDetails;
import jakarta.servlet.http.HttpServletRequest;

public interface SessionDetailsService {
    SessionDetails getSessionDetails(HttpServletRequest request);
    String getIp(HttpServletRequest request);
    String getOs(HttpServletRequest request);
    String getBrowser(HttpServletRequest request);
}
