package com.sidaf.backend.controller;

import com.sidaf.backend.model.Permiso;
import com.sidaf.backend.service.PermisoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/permisos")
@CrossOrigin(origins = "*")
@Slf4j
public class PermisoController {
    
    @Autowired
    private PermisoService permisoService;
    
    /**
     * Obtener todos los permisos activos
     */
    @GetMapping
    public ResponseEntity<?> obtenerTodosPermisos() {
        try {
            List<Permiso> permisos = permisoService.obtenerTodosPermisos();
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "datos", permisos,
                "cantidad", permisos.size()
            ));
        } catch (Exception e) {
            log.error("Error al obtener permisos", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Obtener permisos por módulo
     */
    @GetMapping("/modulo/{modulo}")
    public ResponseEntity<?> obtenerPermisosPorModulo(@PathVariable String modulo) {
        try {
            List<Permiso> permisos = permisoService.obtenerPermisosPorModulo(modulo);
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "modulo", modulo,
                "datos", permisos,
                "cantidad", permisos.size()
            ));
        } catch (Exception e) {
            log.error("Error al obtener permisos por módulo", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Obtener permisos de un usuario
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> obtenerPermisosDelUsuario(@PathVariable Long usuarioId) {
        try {
            List<Permiso> permisos = permisoService.obtenerPermisosDelUsuario(usuarioId);
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "usuarioId", usuarioId,
                "datos", permisos,
                "cantidad", permisos.size()
            ));
        } catch (Exception e) {
            log.error("Error al obtener permisos del usuario", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Verificar si usuario tiene permiso específico
     */
    @GetMapping("/usuario/{usuarioId}/tiene/{codigoPermiso}")
    public ResponseEntity<?> tienePermiso(@PathVariable Long usuarioId, @PathVariable String codigoPermiso) {
        try {
            boolean tiene = permisoService.tienePermiso(usuarioId, codigoPermiso);
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "usuarioId", usuarioId,
                "permiso", codigoPermiso,
                "tiene", tiene
            ));
        } catch (Exception e) {
            log.error("Error al verificar permiso", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Asignar permiso dinámico a usuario
     */
    @PostMapping("/asignar")
    public ResponseEntity<?> asignarPermiso(@RequestBody Map<String, Object> datos) {
        try {
            Long usuarioId = ((Number) datos.get("usuarioId")).longValue();
            Long permisoId = ((Number) datos.get("permisoId")).longValue();
            Long asignadoPorId = ((Number) datos.get("asignadoPorId")).longValue();
            String razon = (String) datos.get("razon");
            
            permisoService.asignarPermisoAUsuario(usuarioId, permisoId, asignadoPorId, razon);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Permiso asignado exitosamente",
                "usuarioId", usuarioId,
                "permisoId", permisoId
            ));
        } catch (Exception e) {
            log.error("Error al asignar permiso", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Revocar permiso dinámico
     */
    @PostMapping("/revocar")
    public ResponseEntity<?> revocarPermiso(@RequestBody Map<String, Object> datos) {
        try {
            Long usuarioId = ((Number) datos.get("usuarioId")).longValue();
            Long permisoId = ((Number) datos.get("permisoId")).longValue();
            Long revocadoPorId = ((Number) datos.get("revocadoPorId")).longValue();
            String razon = (String) datos.get("razon");
            
            permisoService.revocarPermiso(usuarioId, permisoId, revocadoPorId, razon);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Permiso revocado exitosamente",
                "usuarioId", usuarioId,
                "permisoId", permisoId
            ));
        } catch (Exception e) {
            log.error("Error al revocar permiso", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
