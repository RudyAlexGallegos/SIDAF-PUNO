package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "arbitro_snapshot")
@Data
@NoArgsConstructor
public class ArbitroSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "arbitro_id", nullable = false)
    private Long arbitroId;

    @Column(nullable = false)
    private String nombre;

    private String apellido;

    private String dni;

    private String genero;

    private String provincia;

    private String distrito;

    @Column(nullable = false)
    private String categoria;

    private String especialidad;

    private String estado;

    private Integer experiencia;

    private String nivelPreparacion;

    private Boolean disponible;

    @Column(name = "fecha_snapshot")
    private LocalDateTime fechaSnapshot;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
