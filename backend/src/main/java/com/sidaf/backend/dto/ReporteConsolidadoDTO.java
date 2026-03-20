package com.sidaf.backend.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * DTO para reporte consolidado de asistencia
 * Devuelve estadísticas completas por período con breakdowns detallados
 */
public class ReporteConsolidadoDTO {
    
    private String tipo;
    private Map<String, String> periodo;
    private ResumenDTO resumen;
    private Map<String, EstadisticaDiaDTO> porDia;
    private Map<String, EstadisticaActividadDTO> porActividad;
    private List<ArbitroEstadisticaDTO> porArbitros;
    private List<DiaFaltanteDTO> diasFaltantes;
    private TendenciaDTO tendencia;
    
    // Constructores
    public ReporteConsolidadoDTO() {}
    
    // Getters y Setters
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    
    public Map<String, String> getPeriodo() { return periodo; }
    public void setPeriodo(Map<String, String> periodo) { this.periodo = periodo; }
    
    public ResumenDTO getResumen() { return resumen; }
    public void setResumen(ResumenDTO resumen) { this.resumen = resumen; }
    
    public Map<String, EstadisticaDiaDTO> getPorDia() { return porDia; }
    public void setPorDia(Map<String, EstadisticaDiaDTO> porDia) { this.porDia = porDia; }
    
    public Map<String, EstadisticaActividadDTO> getPorActividad() { return porActividad; }
    public void setPorActividad(Map<String, EstadisticaActividadDTO> porActividad) { this.porActividad = porActividad; }
    
    public List<ArbitroEstadisticaDTO> getPorArbitros() { return porArbitros; }
    public void setPorArbitros(List<ArbitroEstadisticaDTO> porArbitros) { this.porArbitros = porArbitros; }
    
    public List<DiaFaltanteDTO> getDiasFaltantes() { return diasFaltantes; }
    public void setDiasFaltantes(List<DiaFaltanteDTO> diasFaltantes) { this.diasFaltantes = diasFaltantes; }
    
    public TendenciaDTO getTendencia() { return tendencia; }
    public void setTendencia(TendenciaDTO tendencia) { this.tendencia = tendencia; }
    
    // Clases internas
    public static class ResumenDTO {
        private int totalRegistros;
        private int presentes;
        private int ausentes;
        private int tardanzas;
        private int justificaciones;
        private double porcentajeAsistencia;
        private int diasRegistrados;
        private int diasObligatorios;
        
        public int getTotalRegistros() { return totalRegistros; }
        public void setTotalRegistros(int totalRegistros) { this.totalRegistros = totalRegistros; }
        
        public int getPresentes() { return presentes; }
        public void setPresentes(int presentes) { this.presentes = presentes; }
        
        public int getAusentes() { return ausentes; }
        public void setAusentes(int ausentes) { this.ausentes = ausentes; }
        
        public int getTardanzas() { return tardanzas; }
        public void setTardanzas(int tardanzas) { this.tardanzas = tardanzas; }
        
        public int getJustificaciones() { return justificaciones; }
        public void setJustificaciones(int justificaciones) { this.justificaciones = justificaciones; }
        
        public double getPorcentajeAsistencia() { return porcentajeAsistencia; }
        public void setPorcentajeAsistencia(double porcentajeAsistencia) { this.porcentajeAsistencia = porcentajeAsistencia; }
        
        public int getDiasRegistrados() { return diasRegistrados; }
        public void setDiasRegistrados(int diasRegistrados) { this.diasRegistrados = diasRegistrados; }
        
        public int getDiasObligatorios() { return diasObligatorios; }
        public void setDiasObligatorios(int diasObligatorios) { this.diasObligatorios = diasObligatorios; }
    }
    
    public static class EstadisticaDiaDTO {
        private String dia;
        private int numeroDia;
        private boolean esObligatorio;
        private int total;
        private int presentes;
        private int ausentes;
        private int tardanzas;
        private int justificaciones;
        private double porcentajeAsistencia;
        
        public String getDia() { return dia; }
        public void setDia(String dia) { this.dia = dia; }
        
        public int getNumeroDia() { return numeroDia; }
        public void setNumeroDia(int numeroDia) { this.numeroDia = numeroDia; }
        
        public boolean isEsObligatorio() { return esObligatorio; }
        public void setEsObligatorio(boolean esObligatorio) { this.esObligatorio = esObligatorio; }
        
        public int getTotal() { return total; }
        public void setTotal(int total) { this.total = total; }
        
        public int getPresentes() { return presentes; }
        public void setPresentes(int presentes) { this.presentes = presentes; }
        
        public int getAusentes() { return ausentes; }
        public void setAusentes(int ausentes) { this.ausentes = ausentes; }
        
        public int getTardanzas() { return tardanzas; }
        public void setTardanzas(int tardanzas) { this.tardanzas = tardanzas; }
        
        public int getJustificaciones() { return justificaciones; }
        public void setJustificaciones(int justificaciones) { this.justificaciones = justificaciones; }
        
        public double getPorcentajeAsistencia() { return porcentajeAsistencia; }
        public void setPorcentajeAsistencia(double porcentajeAsistencia) { this.porcentajeAsistencia = porcentajeAsistencia; }
    }
    
    public static class EstadisticaActividadDTO {
        private String actividad;
        private int total;
        private int presentes;
        private int ausentes;
        private int tardanzas;
        private int justificaciones;
        private double porcentaje;
        
        public String getActividad() { return actividad; }
        public void setActividad(String actividad) { this.actividad = actividad; }
        
        public int getTotal() { return total; }
        public void setTotal(int total) { this.total = total; }
        
        public int getPresentes() { return presentes; }
        public void setPresentes(int presentes) { this.presentes = presentes; }
        
        public int getAusentes() { return ausentes; }
        public void setAusentes(int ausentes) { this.ausentes = ausentes; }
        
        public int getTardanzas() { return tardanzas; }
        public void setTardanzas(int tardanzas) { this.tardanzas = tardanzas; }
        
        public int getJustificaciones() { return justificaciones; }
        public void setJustificaciones(int justificaciones) { this.justificaciones = justificaciones; }
        
        public double getPorcentaje() { return porcentaje; }
        public void setPorcentaje(double porcentaje) { this.porcentaje = porcentaje; }
    }
    
    public static class ArbitroEstadisticaDTO {
        private Long arbitroId;
        private String nombreArbitro;
        private String categoria;
        private int totalRegistros;
        private int presentes;
        private int ausentes;
        private int tardanzas;
        private int justificaciones;
        private double porcentajeAsistencia;
        private int rachaActual;
        private String tendencia; // "mejora", "estable", "declive"
        
        public Long getArbitroId() { return arbitroId; }
        public void setArbitroId(Long arbitroId) { this.arbitroId = arbitroId; }
        
        public String getNombreArbitro() { return nombreArbitro; }
        public void setNombreArbitro(String nombreArbitro) { this.nombreArbitro = nombreArbitro; }
        
        public String getCategoria() { return categoria; }
        public void setCategoria(String categoria) { this.categoria = categoria; }
        
        public int getTotalRegistros() { return totalRegistros; }
        public void setTotalRegistros(int totalRegistros) { this.totalRegistros = totalRegistros; }
        
        public int getPresentes() { return presentes; }
        public void setPresentes(int presentes) { this.presentes = presentes; }
        
        public int getAusentes() { return ausentes; }
        public void setAusentes(int ausentes) { this.ausentes = ausentes; }
        
        public int getTardanzas() { return tardanzas; }
        public void setTardanzas(int tardanzas) { this.tardanzas = tardanzas; }
        
        public int getJustificaciones() { return justificaciones; }
        public void setJustificaciones(int justificaciones) { this.justificaciones = justificaciones; }
        
        public double getPorcentajeAsistencia() { return porcentajeAsistencia; }
        public void setPorcentajeAsistencia(double porcentajeAsistencia) { this.porcentajeAsistencia = porcentajeAsistencia; }
        
        public int getRachaActual() { return rachaActual; }
        public void setRachaActual(int rachaActual) { this.rachaActual = rachaActual; }
        
        public String getTendencia() { return tendencia; }
        public void setTendencia(String tendencia) { this.tendencia = tendencia; }
    }
    
    public static class DiaFaltanteDTO {
        private LocalDate fecha;
        private String diaSemana;
        private String actividad;
        
        public LocalDate getFecha() { return fecha; }
        public void setFecha(LocalDate fecha) { this.fecha = fecha; }
        
        public String getDiaSemana() { return diaSemana; }
        public void setDiaSemana(String diaSemana) { this.diaSemana = diaSemana; }
        
        public String getActividad() { return actividad; }
        public void setActividad(String actividad) { this.actividad = actividad; }
    }
    
    public static class TendenciaDTO {
        private double porcentajeActual;
        private double porcentajeAnterior;
        private double cambioPorcentaje;
        private String direccion; // "subiendo", "bajando", "estable"
        
        public double getPorcentajeActual() { return porcentajeActual; }
        public void setPorcentajeActual(double porcentajeActual) { this.porcentajeActual = porcentajeActual; }
        
        public double getPorcentajeAnterior() { return porcentajeAnterior; }
        public void setPorcentajeAnterior(double porcentajeAnterior) { this.porcentajeAnterior = porcentajeAnterior; }
        
        public double getCambioPorcentaje() { return cambioPorcentaje; }
        public void setCambioPorcentaje(double cambioPorcentaje) { this.cambioPorcentaje = cambioPorcentaje; }
        
        public String getDireccion() { return direccion; }
        public void setDireccion(String direccion) { this.direccion = direccion; }
    }
}
