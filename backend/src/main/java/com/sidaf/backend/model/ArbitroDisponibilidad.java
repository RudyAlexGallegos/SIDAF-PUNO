package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Disponibilidad / ocupación centralizada de un árbitro.
 *
 * Cada fila representa un bloqueo de un árbitro en una FECHA concreta (día completo),
 * ya sea porque fue designado (tipo DESIGNACION) o por una indisponibilidad manual
 * (PERMISO, LESION, VIAJE, EXAMEN, OTRO).
 *
 * El bloqueo es GLOBAL: si existe una fila BLOQUEADO para (arbitroId, fecha),
 * el árbitro está "No disponible" para cualquier otra designación en esa fecha,
 * sin importar el campeonato.
 */
@Entity
@Table(name = "arbitro_disponibilidad")
@Data
@NoArgsConstructor
public class ArbitroDisponibilidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "arbitro_id", nullable = false)
    private Long arbitroId;

    /** Nombre del árbitro denormalizado, para mostrar sin joins adicionales. */
    @Column(name = "arbitro_nombre")
    private String arbitroNombre;

    @Column(nullable = false)
    private LocalDate fecha;

    private String hora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoIndisponibilidad tipo = TipoIndisponibilidad.DESIGNACION;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoBloqueo estado = EstadoBloqueo.BLOQUEADO;

    /** Designación que originó el bloqueo (null si es indisponibilidad manual). */
    @Column(name = "designacion_id")
    private Long designacionId;

    @Column(name = "campeonato_id")
    private Long campeonatoId;

    @Column(name = "campeonato_nombre")
    private String campeonatoNombre;

    /** Rol del árbitro en la designación: PRINCIPAL, ASISTENTE_1, etc. */
    private String rol;

    /** Trazabilidad: otros árbitros asignados junto con él en esa designación. */
    @Column(name = "equipo_trabajo", columnDefinition = "TEXT")
    private String equipoTrabajo;

    /** Motivo libre (usado principalmente en indisponibilidades manuales). */
    @Column(columnDefinition = "TEXT")
    private String motivo;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum TipoIndisponibilidad {
        DESIGNACION,
        PERMISO,
        LESION,
        VIAJE,
        EXAMEN,
        OTRO
    }

    public enum EstadoBloqueo {
        BLOQUEADO,
        LIBERADO
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
