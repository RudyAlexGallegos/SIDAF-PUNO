package com.sidaf.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Estado de disponibilidad de un árbitro en una fecha determinada.
 * Incluye el motivo detallado de la indisponibilidad para trazabilidad.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DisponibilidadArbitroDTO {

    private Long arbitroId;
    private String arbitroNombre;
    private String fecha;
    private boolean disponible;

    // Detalle del motivo cuando NO está disponible
    private String tipo;              // DESIGNACION, PERMISO, LESION, VIAJE, EXAMEN, OTRO
    private String motivo;            // Texto legible del motivo
    private Long designacionId;       // Designación que lo bloquea (si aplica)
    private Long campeonatoId;
    private String campeonatoNombre;
    private String hora;
    private String rol;               // Rol en la designación
    private String equipoTrabajo;     // Otros árbitros asignados con él

    public static DisponibilidadArbitroDTO disponible(Long arbitroId, String nombre, String fecha) {
        DisponibilidadArbitroDTO dto = new DisponibilidadArbitroDTO();
        dto.arbitroId = arbitroId;
        dto.arbitroNombre = nombre;
        dto.fecha = fecha;
        dto.disponible = true;
        return dto;
    }
}
