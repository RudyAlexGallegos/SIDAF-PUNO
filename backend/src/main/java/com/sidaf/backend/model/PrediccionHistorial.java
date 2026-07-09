package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "prediccion_historial")
@Data
@NoArgsConstructor
public class PrediccionHistorial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "prediccion_id", nullable = false)
    private Long prediccionId;

    @Column(name = "partido_id")
    private Long partidoId;

    @Column(name = "campeonato_id", nullable = false)
    private Long campeonatoId;

    @Column(name = "etapa")
    private String etapa;

    @Column(name = "arbitro_id")
    private Long arbitroId;

    @Column(name = "resultado_real", columnDefinition = "TEXT")
    private String resultadoReal;

    @Column(name = "prediccion", columnDefinition = "TEXT")
    private String prediccion;

    @Column(name = "confianza")
    private Double confianza;

    @Column(name = "error")
    private Double error;

    @Column(name = "fecha_prediccion")
    private LocalDateTime fechaPrediccion;

    @Column(name = "fecha_resultado")
    private LocalDateTime fechaResultado;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
