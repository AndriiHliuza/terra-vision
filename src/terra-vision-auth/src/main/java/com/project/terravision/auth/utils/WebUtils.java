package com.project.terravision.auth.utils;

import com.project.terravision.auth.config.attributes.WebAttributes;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

import java.net.URI;
import java.time.Instant;
import java.util.Map;

public abstract class WebUtils {
    public static String extractBearerTokenFromAuthorizationHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith(WebAttributes.BEARER_PREFIX)) {
            throw new IllegalArgumentException("Invalid Authorization header");
        }
        return authHeader.substring(WebAttributes.BEARER_PREFIX.length());
    }

    public static ProblemDetail createProblemDetails(
            HttpStatus status,
            HttpServletRequest request,
            String title,
            String detail,
            Map<String, Object> extraProperties
    ) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(status);

        problemDetail.setTitle(title);
        problemDetail.setDetail(detail);
        problemDetail.setInstance(URI.create(request.getRequestURI()));
        problemDetail.setProperty("timestamp", Instant.now());

        if (extraProperties != null) {
            extraProperties.forEach(problemDetail::setProperty);
        }

        return problemDetail;
    }
}
