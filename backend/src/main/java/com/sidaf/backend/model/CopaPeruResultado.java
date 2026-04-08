package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "copa_peru_resultados", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"campeonato_id", "etapa", "posicion", "equipo_id"})
})
public class CopaPeruResultado {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campeonato_id", nullable = false)
    private Campeonato campeonato;
    
    @Column(nullable = false, length = 50)
    private String etapa; // DISTRITAL, PROVINCIAL, DEPARTAMENTAL
    
    @Column(nullable = false)
    private Integer posicion; // 1 = Campeón, 2 = Subcampeón
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipo_id", nullable = false)
    private Equipo equipo;
    
    @Column
    private LocalDateTime fechaCreacion;
    
    @Column
    private LocalDateTime fechaActualizacion;
    
    public CopaPeruResultado() {
        this.fechaCreacion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
    }
    
    public CopaPeruResultado(Campeonato campeonato, String etapa, Integer posicion, Equipo equipo) {
        this();
        this.campeonato = campeonato;
        this.etapa = etapa;
        this.posicion = posicion;
        this.equipo = equipo;
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Campeonato getCampeonato() {
        return campeonato;
    }
    
    public void setCampeonato(Campeonato campeonato) {
        this.campeonato = campeonato;
    }
    
    public String getEtapa() {
        return etapa;
    }
    
    public void setEtapa(String etapa) {
        this.etapa = etapa;
    }
    
    public Integer getPosicion() {
        return posicion;
    }
    
    public void setPosicion(Integer posicion) {
        this.posicion = posicion;
    }
    
    public Equipo getEquipo() {
        return equipo;
    }
    
    public void setEquipo(Equipo equipo) {
        this.equipo = equipo;
    }
    
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
    
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
    
    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }
    
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}
