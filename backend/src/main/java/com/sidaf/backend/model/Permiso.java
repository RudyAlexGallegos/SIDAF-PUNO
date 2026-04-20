package com.sidaf.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "permisos", uniqueConstraints = {
    @UniqueConstraint(columnNames = "codigo")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Permiso {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 100)
    private String codigo; // arbitros_ver, asistencia_crear, etc.
    
    @Column(nullable = false, length = 255)
    private String nombre;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(nullable = false, length = 50)
    private String modulo; // arbitros, asistencia, designaciones, campeonatos, equipos, reportes, usuarios
    
    @Column(nullable = false, length = 50)
    private String accion; // VER, CREAR, EDITAR, ELIMINAR, EXPORTAR, REGISTRAR
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPermiso estado = EstadoPermiso.ACTIVO;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
