package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "asistencia_detalle")
@Data
@NoArgsConstructor
public class AsistenciaDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asistencia_id", nullable = false)
    private Long asistenciaId;

    @Column(name = "arbitro_id", nullable = false)
    private Long arbitroId;

    @Column(nullable = false)
    private String estado;

    @Column(name = "hora_registro")
    private LocalDateTime horaRegistro;

    @Column(columnDefinition = "text")
    private String observaciones;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
