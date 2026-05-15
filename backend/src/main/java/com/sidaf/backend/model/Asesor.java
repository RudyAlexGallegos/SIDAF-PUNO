package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "asesores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Asesor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Relación con Usuario
    @Column(name = "usuario_id", unique = true, nullable = false)
    private Long usuarioId;
    
    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;
    
    @Column(name = "apellido", nullable = false, length = 150)
    private String apellido;
    
    @Column(name = "dni", unique = true, nullable = false, length = 20)
    private String dni;
    
    @Column(name = "email", nullable = false, length = 255)
    private String email;
    
    @Column(name = "telefono", length = 20)
    private String telefono;
    
    // Especialidad o área de expertise
    @Column(name = "especialidad", length = 255)
    private String especialidad;
    
    // Estado: ACTIVO, INACTIVO, SUSPENDIDO
    @Column(name = "estado", length = 50)
    private String estado = "ACTIVO";
    
    // Descripción o biografía del asesor
    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;
    
    // Foto del asesor
    @Column(name = "foto", columnDefinition = "TEXT")
    private String foto;
    
    // Fecha de registro
    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;
    
    // Última actualización
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    @PrePersist
    protected void onCreate() {
        fechaRegistro = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}
