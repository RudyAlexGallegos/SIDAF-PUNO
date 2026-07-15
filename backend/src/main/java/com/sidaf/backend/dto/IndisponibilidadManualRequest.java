package com.sidaf.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Petición para registrar una indisponibilidad manual de un árbitro
 * (permiso, lesión, viaje, examen u otro). Reemplaza el uso de
 * Map&lt;String,Object&gt; para evitar parseo inseguro y mass-assignment.
 */
@Data
@NoArgsConstructor
public class IndisponibilidadManualRequest {
    private Long arbitroId;
    private String fecha;   // yyyy-MM-dd (o ISO; se normaliza en el servicio)
    private String tipo;    // PERMISO, LESION, VIAJE, EXAMEN, OTRO
    private String motivo;
}
