package com.project.terravision.gateway.service;

import org.springframework.web.server.ServerWebExchange;

public interface CookieService {
    String removeCookieWithNameAndGetMutatedCookieString(ServerWebExchange exchange, String cookieToRemove);
}
