package com.project.terravision.auth.service.impl;

import com.project.terravision.auth.config.WebAttributes;
import com.project.terravision.auth.dto.SessionDetails;
import com.project.terravision.auth.service.SessionDetailsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;

@Service
public class SessionDetailsServiceImpl implements SessionDetailsService {
    @Override
    public SessionDetails getSessionDetails(HttpServletRequest request) {
        return SessionDetails.builder()
                .ip(getIp(request))
                .browser(getBrowser(request))
                .os(getOs(request))
                .createdAt(System.currentTimeMillis())
                .lastUsedAt(System.currentTimeMillis())
                .build();
    }

    @Override
    public String getIp(HttpServletRequest request) {
        String ip = request.getHeader(WebAttributes.X_FORWARDED_FOR_HEADER); // behind proxy/gateway
        if (ip == null || ip.isBlank()) ip = request.getRemoteAddr();
        return ip;
    }

    @Override
    public String getOs(HttpServletRequest request) {
        String userAgent = request.getHeader(HttpHeaders.USER_AGENT);
        if (userAgent == null) return "unknown";
        if (userAgent.contains("Windows")) return "Windows";
        if (userAgent.contains("Mac")) return "MacOS";
        if (userAgent.contains("Linux")) return "Linux";
        if (userAgent.contains("Android")) return "Android";
        if (userAgent.contains("iPhone")) return "iOS";
        return "unknown";
    }

    @Override
    public String getBrowser(HttpServletRequest request) {
        String userAgent = request.getHeader(HttpHeaders.USER_AGENT);
        if (userAgent == null) return "unknown";
        if (userAgent.contains("OPR")) return "Opera";
        if (userAgent.contains("Opera")) return "Opera";
        if (userAgent.contains("Chrome")) return "Chrome";
        if (userAgent.contains("Firefox")) return "Firefox";
        if (userAgent.contains("Safari")) return "Safari";
        if (userAgent.contains("Edge")) return "Edge";
        return "unknown";
    }
}
