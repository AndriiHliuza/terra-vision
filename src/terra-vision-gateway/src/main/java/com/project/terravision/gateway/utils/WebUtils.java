package com.project.terravision.gateway.utils;

import com.project.terravision.gateway.config.attributes.WebAttributes;
import org.springframework.http.HttpCookie;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.server.ServerWebExchange;

import java.util.List;
import java.util.stream.Collectors;

public abstract class WebUtils {

    public static MultiValueMap<String, HttpCookie> filterCookies(MultiValueMap<String, HttpCookie> allCookies, List<String> cookiesToExclude) {
        MultiValueMap<String, HttpCookie> filteredMap = new LinkedMultiValueMap<>(allCookies);
        cookiesToExclude.forEach(filteredMap::remove);
        return filteredMap;
    }

    public static String convertCookiesToString(MultiValueMap<String, HttpCookie> cookies) {
        return cookies.values().stream()
                .flatMap(List::stream)
                .map(cookie -> cookie.getName() + "=" + cookie.getValue())
                .collect(Collectors.joining("; "));
    }

    public static boolean isRequestViaHttps(ServerWebExchange exchange) {
        return exchange.getRequest().getURI().getScheme().equalsIgnoreCase(WebAttributes.HTTPS_SCHEME);
    }
}
