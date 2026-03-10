import axios from "axios";
import {API_DOMAIN, ROUTES} from "./settings.ts";

export const axiosWebClient = axios.create({
    baseURL: API_DOMAIN,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
})

axiosWebClient.interceptors.response.use(config => {
    const csrfToken = document.cookie
        .split("; ")
        .find(row => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1]
    console.log(csrfToken);

    if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
    }

    return config;
})

axiosWebClient.interceptors.response.use(
    response => response,
    error => {
        const url = error.config?.url ?? '';
        const status = error.response?.status;

        // Skip /api/auth/me
        if (url.includes('/api/auth/me')) return Promise.reject(error);

        const lang = window.location.pathname.split('/')[1] ?? 'en';

        if (status === 401) window.location.href = `/${lang}/${ROUTES.LOGIN}`;
        if (status === 403) window.location.href = `/${lang}/${ROUTES.FORBIDDEN}`;

        return Promise.reject(error);
    }
);