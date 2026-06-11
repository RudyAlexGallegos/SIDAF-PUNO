package com.sidaf.backend.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@Slf4j
public class SecurityConfig implements WebMvcConfigurer {
    // CORS is handled by CorsConfig.java to avoid conflicts
}
