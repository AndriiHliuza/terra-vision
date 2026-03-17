package com.project.terravision.gateway.filter;

import org.jspecify.annotations.NullMarked;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/*
* WebFilter always runs before GlobalFilter
* */
@Component
public class GlobalRequestLoggingFilter implements WebFilter, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(GlobalRequestLoggingFilter.class);

    @Override
    @NullMarked
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String method = exchange.getRequest().getMethod().toString();
        String path = exchange.getRequest().getURI().getPath();

        String query = exchange.getRequest().getURI().getQuery();

        logger.info(">>> (Incoming Request) [{}] Path: {}", method, path + (query != null ? "?" + query : ""));

        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            HttpStatusCode statusCode = exchange.getResponse().getStatusCode();
            if (statusCode != null) {
                logger.info("<<< (Outgoing Response) [{}] Path: {} | Status: {}\n", method, path, statusCode.value());
            }
        }));
    }

    @Override
    public int getOrder() {
        /*
         * The lower value the higher priority. The one with higher priority runs first.
         * Ordered.HIGHEST_PRECEDENCE = Integer.MIN_VALUE
         * */
        return Ordered.HIGHEST_PRECEDENCE + 100;
    }

}
