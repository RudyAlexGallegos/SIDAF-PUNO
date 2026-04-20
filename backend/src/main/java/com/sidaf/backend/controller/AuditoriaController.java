package com.sidaf.backend.controller;

import com.sidaf.backend.model.AuditoriaPermiso;
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
    
    /**
     * Obtener auditoría completa paginada
     */
    @GetMapping
    public ResponseEntity<?> obtenerAuditoria(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AuditoriaPermiso> auditoria = auditoriaPermisoRepository.findAllByOrderByFechaCambioDesc(pageable);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "datos", auditoria.getContent(),
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
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "usuarioId", usuarioId,
                "datos", auditoria,
                "cantidad", auditoria.size()
            ));
        } catch (Exception e) {
            log.error("Error al obtener auditoría del usuario", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Obtener auditoría realizada por un usuario (ej: PRESIDENCIA)
     */
    @GetMapping("/realizadosPor/{usuarioId}")
    public ResponseEntity<?> obtenerAuditoriaRealizadaPor(@PathVariable Long usuarioId) {
        try {
            List<AuditoriaPermiso> auditoria = auditoriaPermisoRepository.findByRealizadoPorIdOrderByFechaCambioDesc(usuarioId);
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "realizadoPorId", usuarioId,
                "datos", auditoria,
                "cantidad", auditoria.size()
            ));
        } catch (Exception e) {
            log.error("Error al obtener auditoría realizada por usuario", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
