package com.sidaf.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria_permisos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaPermiso {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TipoCambio tipoCambio; // ASIGNACIÓN, REVOCACIÓN, CAMBIO_ESTADO, CAMBIO_ROL
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_afectado_id")
    private Usuario usuarioAfectado;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permiso_id")
    private Permiso permiso;
    
    @Column(name = "rol_anterior", length = 50)
    private String rolAnterior;
    
    @Column(name = "rol_nuevo", length = 50)
    private String rolNuevo;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "realizado_por", nullable = false)
    private Usuario realizadoPor;
    
    @Column(name = "fecha_cambio")
    private LocalDateTime fechaCambio = LocalDateTime.now();
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(length = 255)
    private String razon;
}
