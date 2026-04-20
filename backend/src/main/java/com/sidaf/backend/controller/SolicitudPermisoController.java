package com.sidaf.backend.controller;

import com.sidaf.backend.model.SolicitudPermiso;
import com.sidaf.backend.service.SolicitudPermisoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.*;

@RestController
@RequestMapping("/api/solicitudes")
@CrossOrigin(origins = {"http://localhost:3000", "https://sidaf-puno-neon.vercel.app", "https://sidaf-puno.vercel.app"})
@Slf4j
public class SolicitudPermisoController {
    
    @Autowired
    private SolicitudPermisoService solicitudPermisoService;
    
    /**
     * Obtener todas las solicitudes pendientes
     * GET /api/solicitudes/pendientes
     */
    @GetMapping("/pendientes")
    public ResponseEntity<List<SolicitudPermiso>> obtenerPendientes() {
        try {
            log.info("GET /api/solicitudes/pendientes");
            List<SolicitudPermiso> solicitudes = solicitudPermisoService.obtenerSolicitudesPendientes();
            log.info("✅ Se obtuvieron {} solicitudes pendientes", solicitudes.size());
            return ResponseEntity.ok(solicitudes);
        } catch (Exception e) {
            log.error("❌ Error al obtener solicitudes pendientes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Obtener solicitudes de un usuario
     * GET /api/solicitudes/usuario/{usuarioId}
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<SolicitudPermiso>> obtenerDelUsuario(@PathVariable Long usuarioId) {
        try {
            log.info("GET /api/solicitudes/usuario/{}", usuarioId);
            List<SolicitudPermiso> solicitudes = solicitudPermisoService.obtenerSolicitudesDelUsuario(usuarioId);
            return ResponseEntity.ok(solicitudes);
        } catch (Exception e) {
            log.error("❌ Error al obtener solicitudes del usuario", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Obtener solicitud por ID
     * GET /api/solicitudes/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<SolicitudPermiso> obtener(@PathVariable Long id) {
        try {
            log.info("GET /api/solicitudes/{}", id);
            Optional<SolicitudPermiso> solicitud = solicitudPermisoService.obtenerSolicitudPorId(id);
            if (solicitud.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(solicitud.get());
        } catch (Exception e) {
            log.error("❌ Error al obtener solicitud", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Crear nueva solicitud
     * POST /api/solicitudes
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody SolicitudPermiso solicitud) {
        try {
            log.info("POST /api/solicitudes");
            SolicitudPermiso nueva = solicitudPermisoService.crearSolicitud(solicitud);
            return ResponseEntity.created(URI.create("/api/solicitudes/" + nueva.getId())).body(nueva);
        } catch (Exception e) {
            log.error("❌ Error al crear solicitud", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", "Error al crear solicitud: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Responder a una solicitud (APROBADO o RECHAZADO)
     * POST /api/solicitudes/{id}/responder
     */
    @PostMapping("/{id}/responder")
    public ResponseEntity<?> responder(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            log.info("POST /api/solicitudes/{}/responder", id);
            
            String accion = (String) body.get("accion");
            String razonRechazo = (String) body.getOrDefault("razonRechazo", "");
            Long respondidoPor = null;
            
            // Obtener respondidoPor si existe en el body
            if (body.containsKey("respondidoPor") && body.get("respondidoPor") != null) {
                respondidoPor = ((Number) body.get("respondidoPor")).longValue();
            }
            
            // Validar acción
            if (accion == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Acción es requerida"
                ));
            }
            
            // Normalizar acción (cambiar APROBAR por APROBADO si es necesario)
            if ("APROBAR".equals(accion)) {
                accion = "APROBADO";
            }
            
            if (!("APROBADO".equals(accion) || "RECHAZADO".equals(accion))) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Acción debe ser APROBADO o RECHAZADO"
                ));
            }
            
            SolicitudPermiso actualizada = solicitudPermisoService.responderSolicitud(
                id, accion, respondidoPor, razonRechazo
            );
            
            log.info("✅ Solicitud {} respondida como: {}", id, accion);
            return ResponseEntity.ok(actualizada);
        } catch (Exception e) {
            log.error("❌ Error al responder solicitud", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", "Error al responder solicitud: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Obtener solicitudes por estado
     * GET /api/solicitudes/estado/{estado}
     */
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<SolicitudPermiso>> obtenerPorEstado(@PathVariable String estado) {
        try {
            log.info("GET /api/solicitudes/estado/{}", estado);
            List<SolicitudPermiso> solicitudes = solicitudPermisoService.obtenerSolicitudesPorEstado(estado);
            return ResponseEntity.ok(solicitudes);
        } catch (Exception e) {
            log.error("❌ Error al obtener solicitudes por estado", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Eliminar solicitud
     * DELETE /api/solicitudes/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            log.info("DELETE /api/solicitudes/{}", id);
            solicitudPermisoService.eliminarSolicitud(id);
            log.info("✅ Solicitud eliminada");
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("❌ Error al eliminar solicitud", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Error al eliminar solicitud: " + e.getMessage()
            ));
        }
    }
}
