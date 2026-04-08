package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "designaciones")
public class Designacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Estructura COPA PERÚ
    @Column(name = "temporada")
    private Integer temporada;  // 2026
    
    @Column(name = "etapa")
    @Enumerated(EnumType.STRING)
    private EtapaContest etapa;  // DISTRITAL, PROVINCIAL, DEPARTAMENTAL
    
    @Column(name = "region")
    private String region;  // PUNO, AREQUIPA, etc.
    
    @Column(name = "provincia")
    private String provincia;  // Opcional, para Provincial/Departamental
    
    @Column(name = "distrito")
    private String distrito;  // Para Distrital
    
    @Column(name = "partido_id")
    private String partidoId;
    
    @Column(name = "id_campeonato")
    private Long idCampeonato;
    
    @Column(name = "nombre_campeonato")
    private String nombreCampeonato;
    
    @Column(name = "id_equipo_local")
    private Long idEquipoLocal;
    
    @Column(name = "nombre_equipo_local")
    private String nombreEquipoLocal;
    
    @Column(name = "id_equipo_visitante")
    private Long idEquipoVisitante;
    
    @Column(name = "nombre_equipo_visitante")
    private String nombreEquipoVisitante;
    
    @Column(nullable = false)
    private String fecha;
    
    private String hora;
    
    private String estadio;
    
    @Column(name = "arbitro_principal")
    private String arbitroPrincipal;
    
    @Column(name = "arbitro_asistente_1")
    private String arbitroAsistente1;
    
    @Column(name = "arbitro_asistente_2")
    private String arbitroAsistente2;
    
    @Column(name = "cuarto_arbitro")
    private String cuartoArbitro;
    
    private String posicion;
    
    @Enumerated(EnumType.STRING)
    private EstadoDesignacion estado;
    
    @Column(columnDefinition = "TEXT")
    private String observaciones;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum EstadoDesignacion {
        PROGRAMADA,
        CONFIRMADA,
        COMPLETADA,
        CANCELADA
    }
    
    public enum EtapaContest {
        DISTRITAL,
        PROVINCIAL,
        DEPARTAMENTAL
    }
    
    // Constructors
    public Designacion() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.estado = EstadoDesignacion.PROGRAMADA;
    }
    
    public Designacion(String partidoId, String fecha) {
        this();
        this.partidoId = partidoId;
        this.fecha = fecha;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getPartidoId() {
        return partidoId;
    }
    
    public void setPartidoId(String partidoId) {
        this.partidoId = partidoId;
    }
    
    public Long getIdCampeonato() {
        return idCampeonato;
    }
    
    public void setIdCampeonato(Long idCampeonato) {
        this.idCampeonato = idCampeonato;
    }
    
    public String getNombreCampeonato() {
        return nombreCampeonato;
    }
    
    public void setNombreCampeonato(String nombreCampeonato) {
        this.nombreCampeonato = nombreCampeonato;
    }
    
    public Long getIdEquipoLocal() {
        return idEquipoLocal;
    }
    
    public void setIdEquipoLocal(Long idEquipoLocal) {
        this.idEquipoLocal = idEquipoLocal;
    }
    
    public String getNombreEquipoLocal() {
        return nombreEquipoLocal;
    }
    
    public void setNombreEquipoLocal(String nombreEquipoLocal) {
        this.nombreEquipoLocal = nombreEquipoLocal;
    }
    
    public Long getIdEquipoVisitante() {
        return idEquipoVisitante;
    }
    
    public void setIdEquipoVisitante(Long idEquipoVisitante) {
        this.idEquipoVisitante = idEquipoVisitante;
    }
    
    public String getNombreEquipoVisitante() {
        return nombreEquipoVisitante;
    }
    
    public void setNombreEquipoVisitante(String nombreEquipoVisitante) {
        this.nombreEquipoVisitante = nombreEquipoVisitante;
    }
    
    public String getFecha() {
        return fecha;
    }
    
    public void setFecha(String fecha) {
        this.fecha = fecha;
    }
    
    public String getHora() {
        return hora;
    }
    
    public void setHora(String hora) {
        this.hora = hora;
    }
    
    public String getEstadio() {
        return estadio;
    }
    
    public void setEstadio(String estadio) {
        this.estadio = estadio;
    }
    
    public String getArbitroPrincipal() {
        return arbitroPrincipal;
    }
    
    public void setArbitroPrincipal(String arbitroPrincipal) {
        this.arbitroPrincipal = arbitroPrincipal;
    }
    
    public String getArbitroAsistente1() {
        return arbitroAsistente1;
    }
    
    public void setArbitroAsistente1(String arbitroAsistente1) {
        this.arbitroAsistente1 = arbitroAsistente1;
    }
    
    public String getArbitroAsistente2() {
        return arbitroAsistente2;
    }
    
    public void setArbitroAsistente2(String arbitroAsistente2) {
        this.arbitroAsistente2 = arbitroAsistente2;
    }
    
    public String getCuartoArbitro() {
        return cuartoArbitro;
    }
    
    public void setCuartoArbitro(String cuartoArbitro) {
        this.cuartoArbitro = cuartoArbitro;
    }
    
    public String getPosicion() {
        return posicion;
    }
    
    public void setPosicion(String posicion) {
        this.posicion = posicion;
    }
    
    public EstadoDesignacion getEstado() {
        return estado;
    }
    
    public void setEstado(EstadoDesignacion estado) {
        this.estado = estado;
    }
    
    public String getObservaciones() {
        return observaciones;
    }
    
    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters para estructura COPA PERÚ 2026
    public Integer getTemporada() {
        return temporada;
    }
    
    public void setTemporada(Integer temporada) {
        this.temporada = temporada;
    }
    
    public EtapaContest getEtapa() {
        return etapa;
    }
    
    public void setEtapa(EtapaContest etapa) {
        this.etapa = etapa;
    }
    
    public String getRegion() {
        return region;
    }
    
    public void setRegion(String region) {
        this.region = region;
    }
    
    public String getProvincia() {
        return provincia;
    }
    
    public void setProvincia(String provincia) {
        this.provincia = provincia;
    }
    
    public String getDistrito() {
        return distrito;
    }
    
    public void setDistrito(String distrito) {
        this.distrito = distrito;
    }
}
