package com.sidaf.backend.controller;

import com.sidaf.backend.model.AuditoriaPermiso;
import com.sidaf.backend.model.Usuario;
import com.sidaf.backend.model.Permiso;
import com.sidaf.backend.model.TipoCambio;
import com.sidaf.backend.repository.AuditoriaPermisoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/auditoria")
@CrossOrigin(origins = "*")
@Slf4j
public class AuditoriaController {
    
    @Autowired
    private AuditoriaPermisoRepository auditoriaPermisoRepository;

    private Map<String, Object> mapUsuario(Usuario u) {
        if (u == null) return null;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", u.getId());
        m.put("nombre", u.getNombre() != null ? u.getNombre() : "");
        m.put("apellido", u.getApellido() != null ? u.getApellido() : "");
        m.put("dni", u.getDni() != null ? u.getDni() : "");
        m.put("email", u.getEmail() != null ? u.getEmail() : "");
        m.put("telefono", u.getTelefono() != null ? u.getTelefono() : "");
        m.put("rol", u.getRol() != null ? u.getRol().name() : null);
        return m;
    }

    private Map<String, Object> mapPermiso(Permiso p) {
        if (p == null) return null;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("codigo", p.getCodigo() != null ? p.getCodigo() : "");
        m.put("nombre", p.getNombre() != null ? p.getNombre() : "");
        m.put("descripcion", p.getDescripcion() != null ? p.getDescripcion() : "");
        return m;
    }

    private Map<String, Object> mapAuditoria(AuditoriaPermiso a) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", a.getId());
        m.put("tipoCambio", a.getTipoCambio() != null ? a.getTipoCambio().name() : null);
        m.put("descripcion", a.getDescripcion() != null ? a.getDescripcion() : "");
        m.put("razon", a.getRazon() != null ? a.getRazon() : "");
        m.put("rolAnterior", a.getRolAnterior());
        m.put("rolNuevo", a.getRolNuevo());
        m.put("fechaCambio", a.getFechaCambio() != null ? a.getFechaCambio().toString() : null);
        m.put("usuario", mapUsuario(a.getUsuario()));
        m.put("usuarioAfectado", mapUsuario(a.getUsuarioAfectado()));
        m.put("realizadoPor", mapUsuario(a.getRealizadoPor()));
        m.put("permiso", mapPermiso(a.getPermiso()));
        return m;
    }

    /**
     * Obtener auditoría completa paginada
     */
    @GetMapping
    public ResponseEntity<?> obtenerAuditoria(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            Pageable pageable = PageRequest.of(page, Math.min(size, 200));
            Page<AuditoriaPermiso> auditoria = auditoriaPermisoRepository.findAllByOrderByFechaCambioDesc(pageable);
            
            List<Map<String, Object>> datos = new ArrayList<>();
            for (AuditoriaPermiso a : auditoria.getContent()) {
                datos.add(mapAuditoria(a));
            }

            return ResponseEntity.ok(Map.of(
                "exito", true,
                "datos", datos,
                "totalElementos", auditoria.getTotalElements(),
                "totalPaginas", auditoria.getTotalPages(),
                "paginaActual", page
            ));
        } catch (Exception e) {
            log.error("Error al obtener auditoría", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Obtener auditoría de un usuario específico
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> obtenerAuditoriaUsuario(@PathVariable Long usuarioId) {
        try {
            List<AuditoriaPermiso> auditoria = auditoriaPermisoRepository.findByUsuarioIdOrderByFechaCambioDesc(usuarioId);
            List<Map<String, Object>> datos = new ArrayList<>();
            for (AuditoriaPermiso a : auditoria) datos.add(mapAuditoria(a));
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "usuarioId", usuarioId,
                "datos", datos,
                "cantidad", datos.size()
            ));
        } catch (Exception e) {
            log.error("Error al obtener auditoría del usuario", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
/**
      * Obtener auditoría realizada por un usuario
      */
    @GetMapping("/realizadosPor/{usuarioId}")
    public ResponseEntity<?> obtenerAuditoriaRealizadaPor(@PathVariable Long usuarioId) {
        try {
            List<AuditoriaPermiso> auditoria = auditoriaPermisoRepository.findByRealizadoPorIdOrderByFechaCambioDesc(usuarioId);
            List<Map<String, Object>> datos = new ArrayList<>();
            for (AuditoriaPermiso a : auditoria) datos.add(mapAuditoria(a));
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "realizadoPorId", usuarioId,
                "datos", datos,
                "cantidad", datos.size()
            ));
        } catch (Exception e) {
            log.error("Error al obtener auditoría realizada por usuario", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener todos los registros de auditoría sin paginación (para exportación LSTM)
     */
    @GetMapping("/todos")
    public ResponseEntity<?> obtenerTodasAuditorias(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta) {
        try {
            List<AuditoriaPermiso> auditoria;
            
            if (tipo != null && !tipo.isEmpty()) {
                auditoria = auditoriaPermisoRepository.findByTipoCambio(com.sidaf.backend.model.TipoCambio.valueOf(tipo));
            } else if (fechaDesde != null && fechaHasta != null) {
                java.time.LocalDateTime desde = java.time.LocalDateTime.parse(fechaDesde + "T00:00:00");
                java.time.LocalDateTime hasta = java.time.LocalDateTime.parse(fechaHasta + "T23:59:59");
                auditoria = auditoriaPermisoRepository.findByFechaCambioBetweenOrderByFechaCambioDesc(desde, hasta);
            } else {
                auditoria = auditoriaPermisoRepository.findAllByOrderByFechaCambioDesc(PageRequest.of(0, 10000)).getContent();
            }

            List<Map<String, Object>> datos = new ArrayList<>();
            for (AuditoriaPermiso a : auditoria) {
                Map<String, Object> m = mapAuditoria(a);
                // Agregar campos de tiempo para entrenamiento LSTM
                if (a.getFechaCambio() != null) {
                    m.put("diaSemana", a.getFechaCambio().getDayOfWeek().getValue());
                    m.put("mes", a.getFechaCambio().getMonthValue());
                    m.put("año", a.getFechaCambio().getYear());
                    m.put("hora", a.getFechaCambio().getHour());
                    m.put("minuto", a.getFechaCambio().getMinute());
                }
                datos.add(m);
            }
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "datos", datos,
                "totalRegistros", datos.size(),
                "metadata", Map.of(
                    "descripcion", "Dataset para entrenamiento LSTM de designación de árbitros",
                    "generado", java.time.LocalDateTime.now().toString()
                )
            ));
        } catch (Exception e) {
            log.error("Error al obtener todas las auditorías", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
