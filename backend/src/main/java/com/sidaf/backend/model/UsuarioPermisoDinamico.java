package com.sidaf.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuario_permiso_dinamico", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"usuario_id", "permiso_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioPermisoDinamico {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "permiso_id", nullable = false)
    private Permiso permiso;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asignado_por", nullable = false)
    private Usuario asignadoPor;
    
    @Column(name = "fecha_asignacion")
    private LocalDateTime fechaAsignacion = LocalDateTime.now();
    
    @Column(name = "fecha_expiracion")
    private LocalDateTime fechaExpiracion; // NULL = sin expiración
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPermiso estado = EstadoPermiso.ACTIVO;
    
    @Column(columnDefinition = "TEXT")
    private String notas;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
