package com.project.terravision.gateway.utils;

import org.springframework.http.HttpCookie;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

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
}
