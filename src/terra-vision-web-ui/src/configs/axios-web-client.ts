import axios from "axios";
import {API_DOMAIN} from "./settings.ts";
import i18n from "./i18n.ts";

export const axiosWebClient = axios.create({
    baseURL: API_DOMAIN,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
})

// ------------ Set language header on every request & Attach CSRF token ------------
axiosWebClient.interceptors.request.use(config => {
    config.headers["Accept-Language"] = i18n.language || "en";

    const csrfToken = document.cookie
        .split("; ")
        .find(row => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1]

    if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
    }

    return config;
});

// ------------ Handle auth errors ------------
axiosWebClient.interceptors.response.use(
    response => response,
    error => {
        const status = error.response?.status;

        if (status === 401) window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        if (status === 403) window.dispatchEvent(new CustomEvent('auth:forbidden'));

        return Promise.reject(error);
    }
);