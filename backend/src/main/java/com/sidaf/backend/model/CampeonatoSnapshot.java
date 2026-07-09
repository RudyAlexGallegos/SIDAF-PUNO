package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "campeonato_snapshot")
@Data
@NoArgsConstructor
public class CampeonatoSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "campeonato_id", nullable = false)
    private Long campeonatoId;

    @Column(nullable = false)
    private String nombre;

    private String categoria;

    private String tipo;

    @Column(name = "fecha_inicio")
    private String fechaInicio;

    @Column(name = "fecha_fin")
    private String fechaFin;

    @Column(nullable = false)
    private String estado;

    private String provincia;

    @Column(name = "nivel_dificultad")
    private String nivelDificultad;

    @Column(name = "numero_equipos")
    private Integer numeroEquipos;

    private String formato;

    @Column(name = "fecha_snapshot")
    private LocalDateTime fechaSnapshot;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
