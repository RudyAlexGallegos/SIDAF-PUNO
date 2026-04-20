package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "campeonatos")
@Data
@NoArgsConstructor
public class Campeonato {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nombre;
    
    private String categoria;
    
    private String tipo;
    
    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;
    
    @Column(name = "fecha_fin")
    private LocalDate fechaFin;
    
    @Enumerated(EnumType.STRING)
    private EstadoCampeonato estado;
    
    private String organizador;
    
    private String contacto;
    
    private String ciudad;
    
    private String provincia;
    
    private String direccion;
    
    private String estadio;
    
    private String horaInicio;
    
    private String horaFin;
    
    private String diasJuego;
    
    @Column(name = "nivel_dificultad")
    private String nivelDificultad;
    
    @Column(name = "numero_equipos")
    private Integer numeroEquipos;
    
    private String formato;
    
    @Column(columnDefinition = "TEXT")
    private String reglas;
    
    @Column(columnDefinition = "TEXT")
    private String premios;
    
    @Column(columnDefinition = "TEXT")
    private String observaciones;
    
    private String logo;
    
    @Column(name = "fecha_creacion")
    private LocalDate fechaCreacion;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "campeonato_equipos", joinColumns = @JoinColumn(name = "campeonato_id"))
    @Column(name = "equipo_id")
    private List<Long> equipos = new ArrayList<>();
    
    @Column(columnDefinition = "TEXT")
    private String etapas;

    // COPA PERÚ 2026: Estructura Jerárquica
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campeonato_padre_id")
    private Campeonato campeonatoPadre;

    @OneToMany(mappedBy = "campeonatoPadre", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Campeonato> campeonatosHijos;
    
    public enum EstadoCampeonato {
        PROGRAMADO,
        ACTIVO,
        FINALIZADO
    }
}
