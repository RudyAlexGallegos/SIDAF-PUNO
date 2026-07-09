package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "dataset_config")
@Data
@NoArgsConstructor
public class DatasetConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "formato_salida", nullable = false)
    private String formatoSalida;

    @Column(name = "campeonato_id")
    private Long campeonatoId;

    @Column(name = "fecha_desde")
    private String fechaDesde;

    @Column(name = "fecha_hasta")
    private String fechaHasta;

    @Column(name = "incluir_arbitros")
    private Boolean incluirArbitros = true;

    @Column(name = "incluir_equipos")
    private Boolean incluirEquipos = true;

    @Column(name = "incluir_partidos")
    private Boolean incluirPartidos = true;

    @Column(name = "incluir_evaluaciones")
    private Boolean incluirEvaluaciones = true;

    @Column(name = "incluir_designaciones")
    private Boolean incluirDesignaciones = true;

    @Column(name = "incluir_asistencias")
    private Boolean incluirAsistencias = true;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
