package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "equipo_snapshot")
@Data
@NoArgsConstructor
public class EquipoSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "equipo_id", nullable = false)
    private Integer equipoId;

    @Column(nullable = false)
    private String nombre;

    private String categoria;

    private String provincia;

    private String distrito;

    private String estadio;

    private String direccion;

    private String telefono;

    private String email;

    @Column(name = "fecha_snapshot")
    private LocalDateTime fechaSnapshot;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
