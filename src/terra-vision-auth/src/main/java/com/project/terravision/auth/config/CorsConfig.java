package com.project.terravision.auth.config;

import com.project.terravision.auth.config.properties.SecurityProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

//@Configuration
//@RequiredArgsConstructor
public class CorsConfig /*implements WebMvcConfigurer*/ {

//    private final SecurityProperties securityProperties;

//    @Override
//    public void addCorsMappings(CorsRegistry registry) {
//        registry
//                .addMapping("/**")
//                .allowedOrigins(securityProperties.getAllowedOrigins().toArray(String[]::new))
//                .allowedMethods("*")
//                .allowedHeaders("*")
//                .allowCredentials(true);
//    }

}
