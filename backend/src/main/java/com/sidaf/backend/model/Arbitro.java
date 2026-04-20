package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "arbitros")
@Data
@NoArgsConstructor
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
}
