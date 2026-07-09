package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "predicciones")
@Data
@NoArgsConstructor
public class Prediccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "model_version_id", nullable = false)
    private Long modelVersionId;

    @Column(name = "partido_id")
    private Long partidoId;

    @Column(name = "campeonato_id", nullable = false)
    private Long campeonatoId;

    @Column(name = "etapa")
    private String etapa;

    @Column(name = "arbitro_id")
    private Long arbitroId;

    @Column(name = "prediccion", columnDefinition = "TEXT")
    private String prediccion;

    @Column(name = "confianza")
    private Double confianza;

    @Column(name = "metadatos", columnDefinition = "TEXT")
    private String metadatos;

    @Column(name = "fecha_prediccion")
    private LocalDateTime fechaPrediccion;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
