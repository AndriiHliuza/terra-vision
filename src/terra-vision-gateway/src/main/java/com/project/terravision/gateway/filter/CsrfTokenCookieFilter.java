package com.project.terravision.gateway.filter;

import com.project.terravision.gateway.utils.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.web.server.csrf.CsrfToken;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Slf4j
public class CsrfTokenCookieFilter implements WebFilter {
    @Override
    @NullMarked
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        if (!SecurityUtils.requiresCsrfTokenGeneration(path)) {
            return chain.filter(exchange);
        }

        boolean hasCsrfCookie = exchange.getRequest().getCookies().getFirst("XSRF-TOKEN") != null;
        if (hasCsrfCookie) {
            log.debug("Path [{}] | Reusing old token", path);
        } else {
            log.debug("Path [{}] | Generating csrfToken token", path);
        }

        // Spring Security stores the CSRF token as a lazy Mono<CsrfToken> in the exchange attributes.
        // It is lazy — nothing happens (token is not generated) until someone subscribes to it.
        // Token is generated under the hood in WebFilterChain class
        Mono<CsrfToken> csrfTokenMono = exchange.getAttribute(CsrfToken.class.getName());

        if (csrfTokenMono == null) {
            log.debug("CsrfTokenMono is null | Skipping cookie writing");
            return chain.filter(exchange);
        }

        return csrfTokenMono
                /*
                 * Logs the generated token if csrfTokenMono is not an empty mono (if it contains the csrfToken value)
                 * If csrfToken value is not in the csrfTokenMono that means Mono is empty and doOnNext is skipped and the Mono just pipeline continues without executing doOnNext
                 * */
                .doOnNext(csrfToken -> log.debug("CsrfToken value={}", csrfToken.getToken())) // Logs the generated token if

                /*
                 * Fallback to an alternative Mono if csrfTokenMono is empty (token wasn't generated)
                 * */
                .switchIfEmpty(Mono.fromRunnable(() -> log.debug("CsrfToken is empty")))

                /*
                 * Happens anyway, no matter if csrf token was generated or not
                 * Happens anyway even if we do not specify doOnNext or switchIfEmpty
                 * */
                .then(chain.filter(exchange));
    }
}
