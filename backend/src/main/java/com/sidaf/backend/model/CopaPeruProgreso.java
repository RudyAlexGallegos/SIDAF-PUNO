package com.sidaf.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "copa_peru_progreso")
@Data
@NoArgsConstructor
public class CopaPeruProgreso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campeonato_id", nullable = false)
    private Campeonato campeonato;

    @Column(nullable = false, length = 50)
    private String etapa;

    @Column(length = 100)
    private String provincia;

    @Column(length = 100)
    private String distrito;

    @Column(nullable = false)
    private boolean completada = false;

    @Column(nullable = false)
    private boolean desbloqueada = false;

    @Column
    private Long campeonId;

    @Column
    private Long subcampeonId;

    @Column(name = "fecha_creacion")
    private java.time.LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private java.time.LocalDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = java.time.LocalDateTime.now();
        fechaActualizacion = fechaCreacion;
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = java.time.LocalDateTime.now();
    }
}
