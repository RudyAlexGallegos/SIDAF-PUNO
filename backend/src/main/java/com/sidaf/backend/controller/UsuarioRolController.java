package com.sidaf.backend.controller;

import com.sidaf.backend.model.Usuario;
import com.sidaf.backend.model.SolicitudPermiso;
import com.sidaf.backend.service.UsuarioRolService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/usuarios-roles")
@CrossOrigin(origins = "*")
@Slf4j
public class UsuarioRolController {
    
    @Autowired
    private UsuarioRolService usuarioRolService;
    
    /**
     * Obtener información completa de usuario con rol y permisos
     */
    @GetMapping("/{usuarioId}")
    public ResponseEntity<?> obtenerInfoCompleta(@PathVariable Long usuarioId) {
        try {
            Map<String, Object> info = usuarioRolService.obtenerInfoUsuarioCompleta(usuarioId);
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "datos", info
            ));
        } catch (Exception e) {
            log.error("Error al obtener info del usuario", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Obtener usuarios pendientes de aprobación
     */
    @GetMapping("/pendientes")
    public ResponseEntity<?> obtenerPendientes() {
        try {
            List<Usuario> pendientes = usuarioRolService.obtenerUsuariosPendientes();
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "datos", pendientes,
                "cantidad", pendientes.size()
            ));
        } catch (Exception e) {
            log.error("Error al obtener usuarios pendientes", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Obtener usuarios por rol
     */
    @GetMapping("/rol/{nombreRol}")
    public ResponseEntity<?> obtenerPorRol(@PathVariable String nombreRol) {
        try {
            List<Usuario> usuarios = usuarioRolService.obtenerUsuariosPorRol(nombreRol);
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "rol", nombreRol,
                "datos", usuarios,
                "cantidad", usuarios.size()
            ));
        } catch (Exception e) {
            log.error("Error al obtener usuarios por rol", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Aprobar usuario PENDIENTE
     */
    @PostMapping("/aprobar/{usuarioId}")
    public ResponseEntity<?> aprobarUsuario(@PathVariable Long usuarioId, 
                                           @RequestBody Map<String, Object> datos) {
        try {
            Long aprobadoPorId = ((Number) datos.get("aprobadoPorId")).longValue();
            String razon = (String) datos.get("razon");
            
            Usuario usuarioAprobado = usuarioRolService.aprobarUsuario(usuarioId, aprobadoPorId, razon);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Usuario aprobado exitosamente",
                "usuarioId", usuarioId,
                "nuevoEstado", usuarioAprobado.getEstado()
            ));
        } catch (Exception e) {
            log.error("Error al aprobar usuario", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Rechazar usuario PENDIENTE
     */
    @PostMapping("/rechazar/{usuarioId}")
    public ResponseEntity<?> rechazarUsuario(@PathVariable Long usuarioId, 
                                            @RequestBody Map<String, Object> datos) {
        try {
            Long rechazadoPorId = ((Number) datos.get("rechazadoPorId")).longValue();
            String razonRechazo = (String) datos.get("razonRechazo");
            
            Usuario usuarioRechazado = usuarioRolService.rechazarUsuario(usuarioId, rechazadoPorId, razonRechazo);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Usuario rechazado",
                "usuarioId", usuarioId,
                "nuevoEstado", usuarioRechazado.getEstado()
            ));
        } catch (Exception e) {
            log.error("Error al rechazar usuario", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Obtener solicitudes de permisos pendientes
     */
    @GetMapping("/solicitudes/pendientes")
    public ResponseEntity<?> obtenerSolicitudesPendientes() {
        try {
            List<SolicitudPermiso> solicitudes = usuarioRolService.obtenerSolicitudesPendientes();
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "datos", solicitudes,
                "cantidad", solicitudes.size()
            ));
        } catch (Exception e) {
            log.error("Error al obtener solicitudes", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Crear solicitud de permiso
     */
    @PostMapping("/solicitud/crear")
    public ResponseEntity<?> crearSolicitud(@RequestBody Map<String, Object> datos) {
        try {
            Long usuarioId = ((Number) datos.get("usuarioId")).longValue();
            String permisoSolicitado = (String) datos.get("permisoSolicitado");
            String descripcion = (String) datos.get("descripcion");
            
            SolicitudPermiso solicitud = usuarioRolService.crearSolicitudPermiso(usuarioId, permisoSolicitado, descripcion);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Solicitud creada exitosamente",
                "solicitudId", solicitud.getId()
            ));
        } catch (Exception e) {
            log.error("Error al crear solicitud", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Aprobar solicitud de permiso
     */
    @PostMapping("/solicitud/aprobar/{solicitudId}")
    public ResponseEntity<?> aprobarSolicitud(@PathVariable Long solicitudId,
                                             @RequestBody Map<String, Object> datos) {
        try {
            Long aprobadoPorId = ((Number) datos.get("aprobadoPorId")).longValue();
            String razon = (String) datos.get("razon");
            
            SolicitudPermiso solicitudAprobada = usuarioRolService.aprobarSolicitudPermiso(solicitudId, aprobadoPorId, razon);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Solicitud aprobada exitosamente",
                "solicitudId", solicitudId,
                "nuevoEstado", solicitudAprobada.getEstado()
            ));
        } catch (Exception e) {
            log.error("Error al aprobar solicitud", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Rechazar solicitud de permiso
     */
    @PostMapping("/solicitud/rechazar/{solicitudId}")
    public ResponseEntity<?> rechazarSolicitud(@PathVariable Long solicitudId,
                                              @RequestBody Map<String, Object> datos) {
        try {
            Long rechazadoPorId = ((Number) datos.get("rechazadoPorId")).longValue();
            String razonRechazo = (String) datos.get("razonRechazo");
            
            SolicitudPermiso solicitudRechazada = usuarioRolService.rechazarSolicitudPermiso(solicitudId, rechazadoPorId, razonRechazo);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Solicitud rechazada",
                "solicitudId", solicitudId,
                "razonRechazo", razonRechazo
            ));
        } catch (Exception e) {
            log.error("Error al rechazar solicitud", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
