package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "campeonatos")
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
    
    @ElementCollection
    @CollectionTable(name = "campeonato_equipos", joinColumns = @JoinColumn(name = "campeonato_id"))
    @Column(name = "equipo_id")
    private List<Long> equipos;
    
    public enum EstadoCampeonato {
        PROGRAMADO,
        ACTIVO,
        FINALIZADO
    }
    
    // Constructors
    public Campeonato() {
        this.fechaCreacion = LocalDate.now();
        this.estado = EstadoCampeonato.PROGRAMADO;
    }
    
    public Campeonato(String nombre) {
        this();
        this.nombre = nombre;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    
    public String getCategoria() {
        return categoria;
    }
    
    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }
    
    public String getTipo() {
        return tipo;
    }
    
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    
    public LocalDate getFechaInicio() {
        return fechaInicio;
    }
    
    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }
    
    public LocalDate getFechaFin() {
        return fechaFin;
    }
    
    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }
    
    public EstadoCampeonato getEstado() {
        return estado;
    }
    
    public void setEstado(EstadoCampeonato estado) {
        this.estado = estado;
    }
    
    public String getOrganizador() {
        return organizador;
    }
    
    public void setOrganizador(String organizador) {
        this.organizador = organizador;
    }
    
    public String getContacto() {
        return contacto;
    }
    
    public void setContacto(String contacto) {
        this.contacto = contacto;
    }
    
    public String getCiudad() {
        return ciudad;
    }
    
    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }
    
    public String getProvincia() {
        return provincia;
    }
    
    public void setProvincia(String provincia) {
        this.provincia = provincia;
    }
    
    public String getDireccion() {
        return direccion;
    }
    
    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }
    
    public String getEstadio() {
        return estadio;
    }
    
    public void setEstadio(String estadio) {
        this.estadio = estadio;
    }
    
    public String getHoraInicio() {
        return horaInicio;
    }
    
    public void setHoraInicio(String horaInicio) {
        this.horaInicio = horaInicio;
    }
    
    public String getHoraFin() {
        return horaFin;
    }
    
    public void setHoraFin(String horaFin) {
        this.horaFin = horaFin;
    }
    
    public String getDiasJuego() {
        return diasJuego;
    }
    
    public void setDiasJuego(String diasJuego) {
        this.diasJuego = diasJuego;
    }
    
    public String getNivelDificultad() {
        return nivelDificultad;
    }
    
    public void setNivelDificultad(String nivelDificultad) {
        this.nivelDificultad = nivelDificultad;
    }
    
    public Integer getNumeroEquipos() {
        return numeroEquipos;
    }
    
    public void setNumeroEquipos(Integer numeroEquipos) {
        this.numeroEquipos = numeroEquipos;
    }
    
    public String getFormato() {
        return formato;
    }
    
    public void setFormato(String formato) {
        this.formato = formato;
    }
    
    public String getReglas() {
        return reglas;
    }
    
    public void setReglas(String reglas) {
        this.reglas = reglas;
    }
    
    public String getPremios() {
        return premios;
    }
    
    public void setPremios(String premios) {
        this.premios = premios;
    }
    
    public String getObservaciones() {
        return observaciones;
    }
    
    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
    
    public String getLogo() {
        return logo;
    }
    
    public void setLogo(String logo) {
        this.logo = logo;
    }
    
    public LocalDate getFechaCreacion() {
        return fechaCreacion;
    }
    
    public void setFechaCreacion(LocalDate fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
    
    public List<Long> getEquipos() {
        return equipos;
    }
    
    public void setEquipos(List<Long> equipos) {
        this.equipos = equipos;
    }
}
