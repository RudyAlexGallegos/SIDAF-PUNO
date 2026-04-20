package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "designaciones")
@Data
@NoArgsConstructor
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
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
