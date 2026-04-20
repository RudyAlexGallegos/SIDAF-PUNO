package com.sidaf.backend.security;

import java.lang.annotation.*;

/**
 * Anotación para validar que el usuario tiene permisos específicos
 * Se usa en métodos de Controller
 * 
 * Ejemplo:
 * @RequierePermiso("arbitros_crear")
 * public ResponseEntity<?> crear() { ... }
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequierePermiso {
    
    /**
     * Código del permiso requerido
     */
    String value();
    
    /**
     * Si true, requiere que sea ADMINISTRADOR
     */
    boolean adminOnly() default false;
}
