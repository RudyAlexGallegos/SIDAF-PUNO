package com.sidaf.backend.service;

import com.sidaf.backend.dto.DisponibilidadArbitroDTO;

import java.util.List;

/**
 * Se lanza cuando una operación de designación intenta bloquear a un árbitro
 * que ya está ocupado (no disponible) en esa fecha. Traslada el detalle del
 * conflicto para informar al usuario (regla de trazabilidad).
 */
public class ConflictoDisponibilidadException extends RuntimeException {

    private final transient List<DisponibilidadArbitroDTO> conflictos;

    public ConflictoDisponibilidadException(String mensaje, List<DisponibilidadArbitroDTO> conflictos) {
        super(mensaje);
        this.conflictos = conflictos;
    }

    public List<DisponibilidadArbitroDTO> getConflictos() {
        return conflictos;
    }
}
