package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "evaluaciones")
@Data
@NoArgsConstructor
public class Evaluacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "designacion_id", nullable = false)
    private Long designacionId;

    @Column(name = "arbitro_id", nullable = false)
    private Long arbitroId;

    @Column(name = "campeonato_id", nullable = false)
    private Long campeonatoId;

    @Column(name = "etapa")
    private String etapa;

    @Column(name = "puntaje_tecnico")
    private Integer puntajeTecnico;

    @Column(name = "puntaje_fisico")
    private Integer puntajeFisico;

    @Column(name = "puntaje_tactico")
    private Integer puntajeTactico;

    @Column(name = "puntaje_disciplina")
    private Integer puntajeDisciplina;

    @Column(name = "puntaje_gestion")
    private Integer puntajeGestion;

    @Column(name = "puntaje_total")
    private Integer puntajeTotal;

    @Column(columnDefinition = "TEXT")
    private String comentarios;

    @Column(name = "evaluado_por")
    private Long evaluadoPor;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
