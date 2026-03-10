package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "asistencia")
public class Asistencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "hora_entrada")
    private LocalDateTime horaEntrada;

    @Column(name = "hora_salida")
    private LocalDateTime horaSalida;

    private String actividad;
    private String evento;
    private String estado;

    @Column(columnDefinition = "text")
    private String observaciones;

    private String latitude;
    private String longitude;

    @Column(name = "responsable_id")
    private Long responsableId;

    private String responsable;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // ========== NUEVOS CAMPOS PARA MEJORA DE ASISTENCIA ==========

    /**
     * Tipo de día: OBLIGATORIO, OPCIONAL, DESCANSO
     * Días obligatorios: Lunes(1), Martes(2), Jueves(4), Viernes(5), Sábado(6)
     */
    @Column(name = "tipo_dia", length = 20)
    private String tipoDia;

    /**
     * Indica si el registro tiene retraso
     */
    @Column(name = "tiene_retraso")
    private Boolean tieneRetraso = false;

    /**
     * Minutos de retraso (0 si no hay retraso)
     */
    @Column(name = "minutos_retraso")
    private Integer minutosRetraso = 0;

    /**
     * Fecha límite para registrar la asistencia obligatoria
     * Permite registrar con retraso hasta esta fecha
     */
    @Column(name = "fecha_limite_registro")
    private LocalDate fechaLimiteRegistro;

    /**
     * Hora programada de la actividad para calcular retrasos
     */
    @Column(name = "hora_programada")
    private LocalTime horaProgramada;

    /**
     * Día de la semana (1=Lunes, 2=Martes, 3=Miercoles, 4=Jueves, 5=Viernes, 6=Sábado, 7=Domingo)
     * Facilita consultas y filtros por día
     */
    @Column(name = "dia_semana")
    private Integer diaSemana;

    // ---------- getters y setters ----------

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public LocalDateTime getHoraEntrada() {
        return horaEntrada;
    }

    public void setHoraEntrada(LocalDateTime horaEntrada) {
        this.horaEntrada = horaEntrada;
    }

    public LocalDateTime getHoraSalida() {
        return horaSalida;
    }

    public void setHoraSalida(LocalDateTime horaSalida) {
        this.horaSalida = horaSalida;
    }

    public String getActividad() {
        return actividad;
    }

    public void setActividad(String actividad) {
        this.actividad = actividad;
    }

    public String getEvento() {
        return evento;
    }

    public void setEvento(String evento) {
        this.evento = evento;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public String getLatitude() {
        return latitude;
    }

    public void setLatitude(String latitude) {
        this.latitude = latitude;
    }

    public String getLongitude() {
        return longitude;
    }

    public void setLongitude(String longitude) {
        this.longitude = longitude;
    }

    public Long getResponsableId() {
        return responsableId;
    }

    public void setResponsableId(Long responsableId) {
        this.responsableId = responsableId;
    }

    public String getResponsable() {
        return responsable;
    }

    public void setResponsable(String responsable) {
        this.responsable = responsable;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // ========== GETTERS Y SETTERS PARA NUEVOS CAMPOS ==========

    public String getTipoDia() {
        return tipoDia;
    }

    public void setTipoDia(String tipoDia) {
        this.tipoDia = tipoDia;
    }

    public Boolean getTieneRetraso() {
        return tieneRetraso;
    }

    public void setTieneRetraso(Boolean tieneRetraso) {
        this.tieneRetraso = tieneRetraso;
    }

    public Integer getMinutosRetraso() {
        return minutosRetraso;
    }

    public void setMinutosRetraso(Integer minutosRetraso) {
        this.minutosRetraso = minutosRetraso;
    }

    public LocalDate getFechaLimiteRegistro() {
        return fechaLimiteRegistro;
    }

    public void setFechaLimiteRegistro(LocalDate fechaLimiteRegistro) {
        this.fechaLimiteRegistro = fechaLimiteRegistro;
    }

    public LocalTime getHoraProgramada() {
        return horaProgramada;
    }

    public void setHoraProgramada(LocalTime horaProgramada) {
        this.horaProgramada = horaProgramada;
    }

    public Integer getDiaSemana() {
        return diaSemana;
    }

    public void setDiaSemana(Integer diaSemana) {
        this.diaSemana = diaSemana;
    }
}
