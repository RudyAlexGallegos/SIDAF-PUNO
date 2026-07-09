package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "etapas_campeonato")
@Data
@NoArgsConstructor
public class EtapaCampeonato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "campeonato_id", nullable = false)
    private Long campeonatoId;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private Integer orden;

    @Column(name = "tipo_formato", nullable = false)
    private String tipoFormato;

    @Column(nullable = false)
    private Boolean activa = true;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
