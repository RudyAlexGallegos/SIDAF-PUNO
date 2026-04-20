package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "asistencia")
@Data
@NoArgsConstructor
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
}
