package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "model_version")
@Data
@NoArgsConstructor
public class ModelVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String version;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "tipo_modelo", nullable = false)
    private String tipoModelo;

    @Column(name = "fecha_entrenamiento")
    private LocalDateTime fechaEntrenamiento;

    @Column(name = "metricas", columnDefinition = "TEXT")
    private String metricas;

    @Column(name = "ruta_archivo")
    private String rutaArchivo;

    @Column(name = "activo")
    private Boolean activo = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
