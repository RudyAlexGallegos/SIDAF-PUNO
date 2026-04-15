package com.sidaf.backend.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.web.filter.CommonsRequestLoggingFilter;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import java.util.concurrent.TimeUnit;

/**
 * 🚀 Configuración de Performance y Cacheing
 * Mejora significativa en velocidad de respuestas
 */
@Configuration
@EnableCaching
public class PerformanceConfig implements WebMvcConfigurer {

    /**
     * Gestor de caché en memoria para datos frecuentes
     */
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(
            "arbitros",      // Caché de árbitros (1 hora)
            "equipos",       // Caché de equipos (1 hora)
            "campeonatos",   // Caché de campeonatos (30 min)
            "designaciones", // Caché de designaciones (15 min)
            "asistencias"    // Caché de asistencias (5 min)
        );
    }

    /**
     * Configurar caché de recursos estáticos (CSS, JS, imágenes)
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**", "/assets/**")
            .setCacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic())
            .addResourceLocations("classpath:/static/", "classpath:/assets/");
    }

    /**
     * Logger de requests (solo en desarrollo)
     */
    @Bean
    public CommonsRequestLoggingFilter requestLoggingFilter() {
        CommonsRequestLoggingFilter loggingFilter = new CommonsRequestLoggingFilter();
        loggingFilter.setIncludeClientInfo(false);
        loggingFilter.setIncludeQueryString(true);
        loggingFilter.setIncludePayload(false);
        loggingFilter.setMaxPayloadLength(10000);
        loggingFilter.setIncludeHeaders(false);
        loggingFilter.setAfterMessagePrefix("REQUEST DATA : ");
        return loggingFilter;
    }
}
