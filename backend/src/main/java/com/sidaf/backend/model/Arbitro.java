package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "arbitros")
public class Arbitro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String apellido;

    // Identificación
    private String dni;
    private String genero;
    private String lugarNacimiento;
    private String estatura;

    @Column(columnDefinition = "text")
    private String foto;

    // Ubicación
    private String provincia;
    private String distrito;

    @Column(nullable = false)
    private String categoria;

    private String direccion;
    private String email;
    private String especialidad;
    private String telefono;
    private String telefonoEmergencia;

    // estado puede ser "Activo", "Inactivo", etc.
    private String estado;

    // experiencia en años
    private Integer experiencia;

    // cambiar a String para aceptar "Básico", "Intermedio", "Avanzado"
    private String nivelPreparacion;

    @Column(columnDefinition = "text")
    private String observaciones;

    private Boolean disponible;

    private LocalDate fechaNacimiento;
    private LocalDate fechaRegistro;
    private LocalDate fechaAfiliacion;
    private LocalDate fechaExamenTeorico;
    private LocalDate fechaExamenPractico;

    private String academiaFormadora;

    @Column(columnDefinition = "text")
    private String roles;

    @Column(columnDefinition = "text")
    private String especialidades;

    private Boolean declaracionJurada;

    // ---------- getters y setters ----------
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }

    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }

    public String getLugarNacimiento() { return lugarNacimiento; }
    public void setLugarNacimiento(String lugarNacimiento) { this.lugarNacimiento = lugarNacimiento; }

    public String getEstatura() { return estatura; }
    public void setEstatura(String estatura) { this.estatura = estatura; }

    public String getFoto() { return foto; }
    public void setFoto(String foto) { this.foto = foto; }

    public String getProvincia() { return provincia; }
    public void setProvincia(String provincia) { this.provincia = provincia; }

    public String getDistrito() { return distrito; }
    public void setDistrito(String distrito) { this.distrito = distrito; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getEspecialidad() { return especialidad; }
    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getTelefonoEmergencia() { return telefonoEmergencia; }
    public void setTelefonoEmergencia(String telefonoEmergencia) { this.telefonoEmergencia = telefonoEmergencia; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Integer getExperiencia() { return experiencia; }
    public void setExperiencia(Integer experiencia) { this.experiencia = experiencia; }

    public String getNivelPreparacion() { return nivelPreparacion; }
    public void setNivelPreparacion(String nivelPreparacion) { this.nivelPreparacion = nivelPreparacion; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public Boolean getDisponible() { return disponible; }
    public void setDisponible(Boolean disponible) { this.disponible = disponible; }

    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }

    public LocalDate getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDate fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public LocalDate getFechaAfiliacion() { return fechaAfiliacion; }
    public void setFechaAfiliacion(LocalDate fechaAfiliacion) { this.fechaAfiliacion = fechaAfiliacion; }

    public LocalDate getFechaExamenTeorico() { return fechaExamenTeorico; }
    public void setFechaExamenTeorico(LocalDate fechaExamenTeorico) { this.fechaExamenTeorico = fechaExamenTeorico; }

    public LocalDate getFechaExamenPractico() { return fechaExamenPractico; }
    public void setFechaExamenPractico(LocalDate fechaExamenPractico) { this.fechaExamenPractico = fechaExamenPractico; }

    public String getAcademiaFormadora() { return academiaFormadora; }
    public void setAcademiaFormadora(String academiaFormadora) { this.academiaFormadora = academiaFormadora; }

    public String getRoles() { return roles; }
    public void setRoles(String roles) { this.roles = roles; }

    public String getEspecialidades() { return especialidades; }
    public void setEspecialidades(String especialidades) { this.especialidades = especialidades; }

    public Boolean getDeclaracionJurada() { return declaracionJurada; }
    public void setDeclaracionJurada(Boolean declaracionJurada) { this.declaracionJurada = declaracionJurada; }
}
