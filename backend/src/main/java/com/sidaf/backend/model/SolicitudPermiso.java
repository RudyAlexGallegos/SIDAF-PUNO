package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "solicitud_permiso")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudPermiso {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;
    
    @Column(name = "usuario_nombre")
    private String usuarioNombre;
    
    @Column(name = "permiso_solicitado", nullable = false, length = 100)
    private String permisoSolicitado;
    
    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(name = "estado", nullable = false, length = 20)
    private String estado; // PENDIENTE, APROBADO, RECHAZADO
    
    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDateTime fechaSolicitud;
    
    @Column(name = "solicitado_en")
    private LocalDateTime solicitadoEn;
    
    @Column(name = "fecha_respuesta")
    private LocalDateTime fechaRespuesta;
    
    @Column(name = "respondido_en")
    private LocalDateTime respondidoEn;
    
    @Column(name = "respondido_por")
    private Long respondidoPor;
    
    @Column(name = "razon_rechazo", columnDefinition = "TEXT")
    private String razonRechazo;
    
    @Column(name = "notas")
    private String notas;
    
    public SolicitudPermiso(Long usuarioId, String permisoSolicitado) {
        this.usuarioId = usuarioId;
        this.permisoSolicitado = permisoSolicitado;
        this.estado = "PENDIENTE";
        this.fechaSolicitud = LocalDateTime.now();
        this.solicitadoEn = LocalDateTime.now();
    }
    
    // Getters específicos para compatibilidad
    public Long getUsuario() {
        return this.usuarioId;
    }
    
    public String getPermiso() {
        return this.permisoSolicitado;
    }
}
