package com.project.terravision.gateway.service;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ServerWebExchange;

import java.util.stream.Collectors;

@Service
public class CookieServiceImpl implements CookieService{
    @Override
    public String removeCookieWithNameAndGetMutatedCookieString(ServerWebExchange exchange, String cookieToRemove) {
        return exchange.getRequest().getCookies()
                .entrySet().stream()
                .filter(entry -> !entry.getKey().equals(cookieToRemove))
                .flatMap(entry -> entry.getValue().stream())
                .map(cookie -> cookie.getName() + "=" + cookie.getValue())
                .collect(Collectors.joining("; "));
    }
}
