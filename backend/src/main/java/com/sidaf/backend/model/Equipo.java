package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "equipos")
@Data
@NoArgsConstructor
public class Equipo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false)
    private String nombre;
    
    private String categoria;
    
    private String provincia;
    
    private String distrito;
    
    private String estadio;
    
    private String nombreEstadio;
    
    private String direccion;
    
    private String telefono;
    
    private String email;
    
    private String colores;
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    
    public Equipo(String nombre, String categoria, String provincia) {
        this.nombre = nombre;
        this.categoria = categoria;
        this.provincia = provincia;
        this.fechaCreacion = LocalDateTime.now();
    }
}
