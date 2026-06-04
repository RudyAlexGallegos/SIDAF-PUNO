package com.sidaf.backend.dto;

import com.sidaf.backend.model.Campeonato;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
public class CampeonatoCreateDTO {
    private String nombre;
    private String categoria;
    private String tipo;
    private String estado;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String organizador;
    private String contacto;
    private String ciudad;
    private String provincia;
    private String direccion;
    private String estadio;
    private String horaInicio;
    private String horaFin;
    private String diasJuego;
    private String nivelDificultad;
    private Integer numeroEquipos;
    private String formato;
    private String reglas;
    private String premios;
    private String observaciones;
    private String logo;
    private List<Integer> equipos;
    private String etapas;

    public Campeonato toEntity() {
        Campeonato campeonato = new Campeonato();
        campeonato.setNombre(this.nombre);
        campeonato.setCategoria(this.categoria);
        campeonato.setTipo(this.tipo);
        
        if (this.estado != null) {
            try {
                campeonato.setEstado(Campeonato.EstadoCampeonato.valueOf(this.estado.toUpperCase()));
            } catch (IllegalArgumentException e) {
                campeonato.setEstado(Campeonato.EstadoCampeonato.PROGRAMADO);
            }
        }
        
        campeonato.setFechaInicio(this.fechaInicio);
        campeonato.setFechaFin(this.fechaFin);
        campeonato.setOrganizador(this.organizador);
        campeonato.setContacto(this.contacto);
        campeonato.setCiudad(this.ciudad);
        campeonato.setProvincia(this.provincia);
        campeonato.setDireccion(this.direccion);
        campeonato.setEstadio(this.estadio);
        campeonato.setHoraInicio(this.horaInicio);
        campeonato.setHoraFin(this.horaFin);
        campeonato.setDiasJuego(this.diasJuego);
        campeonato.setNivelDificultad(this.nivelDificultad);
        campeonato.setNumeroEquipos(this.numeroEquipos);
        campeonato.setFormato(this.formato);
        campeonato.setReglas(this.reglas);
        campeonato.setPremios(this.premios);
        campeonato.setObservaciones(this.observaciones);
        campeonato.setLogo(this.logo);
        campeonato.setEquipos(this.equipos);
        campeonato.setEtapas(this.etapas);
        return campeonato;
    }
}