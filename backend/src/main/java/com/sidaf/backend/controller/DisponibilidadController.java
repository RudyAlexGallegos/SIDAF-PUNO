package com.sidaf.backend.controller;

import com.sidaf.backend.dto.DisponibilidadArbitroDTO;
import com.sidaf.backend.dto.IndisponibilidadManualRequest;
import com.sidaf.backend.model.ArbitroDisponibilidad;
import com.sidaf.backend.model.ArbitroDisponibilidad.TipoIndisponibilidad;
import com.sidaf.backend.service.DisponibilidadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API de disponibilidad centralizada de árbitros.
 *
 * Permite consultar en tiempo real quién está disponible en una fecha,
 * el motivo detallado de indisponibilidad (trazabilidad) y registrar/eliminar
 * bloqueos manuales (permisos, lesiones, viajes, exámenes).
 */
@RestController
@RequestMapping("/api/disponibilidad")
@CrossOrigin(origins = "*")
public class DisponibilidadController {

    @Autowired
    private DisponibilidadService disponibilidadService;

    /** Estado de disponibilidad de TODOS los árbitros en una fecha. */
    @GetMapping("/fecha/{fecha}")
    public List<DisponibilidadArbitroDTO> porFecha(@PathVariable String fecha) {
        return disponibilidadService.consultarPorFecha(fecha);
    }

    /** Estado de disponibilidad de un árbitro concreto en una fecha (con motivo). */
    @GetMapping("/arbitro/{arbitroId}/fecha/{fecha}")
    public DisponibilidadArbitroDTO porArbitroYFecha(@PathVariable Long arbitroId, @PathVariable String fecha) {
        return disponibilidadService.consultarArbitro(arbitroId, fecha);
    }

    /** Todos los bloqueos históricos/actuales de un árbitro. */
    @GetMapping("/arbitro/{arbitroId}")
    public List<ArbitroDisponibilidad> porArbitro(@PathVariable Long arbitroId) {
        return disponibilidadService.listarPorArbitro(arbitroId);
    }

    /**
     * Registrar indisponibilidad manual (no derivada de un partido).
     * Body: { "arbitroId": 1, "fecha": "2026-07-20", "tipo": "PERMISO", "motivo": "..." }
     */
    @PostMapping("/manual")
    public ResponseEntity<?> registrarManual(@RequestBody IndisponibilidadManualRequest req) {
        if (req == null || req.getArbitroId() == null
                || req.getFecha() == null || req.getFecha().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "arbitroId y fecha son obligatorios"));
        }
        TipoIndisponibilidad tipo = TipoIndisponibilidad.OTRO;
        if (req.getTipo() != null && !req.getTipo().isBlank()) {
            try {
                tipo = TipoIndisponibilidad.valueOf(req.getTipo().trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // se mantiene OTRO
            }
        }
        // Nota: DESIGNACION no es un tipo válido para bloqueo manual
        if (tipo == TipoIndisponibilidad.DESIGNACION) {
            tipo = TipoIndisponibilidad.OTRO;
        }
        ArbitroDisponibilidad creado = disponibilidadService.registrarIndisponibilidadManual(
                req.getArbitroId(), req.getFecha(), tipo, req.getMotivo());
        return ResponseEntity.ok(creado);
    }

    /** Eliminar/liberar un bloqueo (por ejemplo, cancelar un permiso). */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        return disponibilidadService.eliminarBloqueo(id)
                ? ResponseEntity.ok().build()
                : ResponseEntity.notFound().build();
    }
}
