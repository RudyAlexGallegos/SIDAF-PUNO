package com.sidaf.backend.security;

import com.sidaf.backend.service.PermisoService;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@Aspect
@Component
@Slf4j
public class PermisoAspect {
    
    @Autowired
    private PermisoService permisoService;
    
    /**
     * Interceptar métodos con anotación @RequierePermiso
     * Valida que el usuario tenga el permiso requerido
     */
    @Before("@annotation(com.sidaf.backend.security.RequierePermiso)")
    public void validarPermiso(JoinPoint joinPoint) throws Throwable {
        
        // Obtener anotación
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        RequierePermiso anotacion = signature.getMethod().getAnnotation(RequierePermiso.class);
        
        // Obtener usuario del header (token o DNI)
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        String usuarioHeader = request.getHeader("X-Usuario-ID");
        
        if (usuarioHeader == null || usuarioHeader.isEmpty()) {
            log.warn("Intento de acceso sin usuario identificado");
            throw new RuntimeException("Usuario no identificado");
        }
        
        Long usuarioId;
        try {
            usuarioId = Long.parseLong(usuarioHeader);
        } catch (NumberFormatException e) {
            log.warn("Header X-Usuario-ID inválido: {}", usuarioHeader);
            throw new RuntimeException("Usuario inválido");
        }
        
        // Validar permiso
        String codigoPermiso = anotacion.value();
        boolean adminOnly = anotacion.adminOnly();
        
        if (!permisoService.tienePermiso(usuarioId, codigoPermiso) && !adminOnly) {
            log.warn("Usuario {} no tiene permiso {}", usuarioId, codigoPermiso);
            throw new RuntimeException("No tienes permiso para acceder a este recurso");
        }
        
        log.info("Acceso permitido para usuario {} al permiso {}", usuarioId, codigoPermiso);
    }
}
