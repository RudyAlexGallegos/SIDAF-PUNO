package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "copa_peru_resultados", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"campeonato_id", "etapa", "posicion", "equipo_id"})
})
@Data
@NoArgsConstructor
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
    
    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}
