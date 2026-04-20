package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "dni", unique = true, nullable = false, length = 20)
    private String dni;
    
    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;
    
    @Column(name = "apellido", nullable = false, length = 150)
    private String apellido;
    
    @Column(name = "email", unique = true, nullable = false, length = 255)
    private String email;
    
    @Column(name = "password", nullable = false, length = 255)
    private String password;
    
    // Roles del sistema
    @Column(name = "rol", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private RolUsuario rol = RolUsuario.UNIDAD_TECNICA;
    
    // Estados: PENDING, ACTIVO, INACTIVO
    @Column(name = "activo", length = 20)
    private String estado = "PENDING";
    
    // Unidad organizacional (ej: "SIDAF PUNO", "SIDAF AREQUIPA", etc.)
    @Column(name = "unidad_organizacional", length = 100)
    private String unidadOrganizacional;
    
    // Permisos específicos en formato JSON
    // Ej: ["VER_ARBITROS", "GESTIONAR_ASISTENCIA", "VER_REPORTES"]
    @Column(name = "permisos_especificos", columnDefinition = "TEXT")
    private String permisosEspecificos;
    
    // ID del árbitro asociado (si es árbitro)
    @Column(name = "arbitro_id")
    private Long arbitroId;
    
    // Usuario que creó este registro (para auditoría)
    @Column(name = "creado_por")
    private Long creadoPor;
    
    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;
    
    @Column(name = "ultimo_acceso")
    private LocalDateTime ultimoAcceso;
    
    @Column(name = "foto", columnDefinition = "TEXT")
    private String foto;
    
    // Teléfono de contacto
    @Column(name = "telefono", length = 20)
    private String telefono;
    
    // Indicador si el usuario ha completado su perfil
    @Column(name = "perfil_completo")
    private Boolean perfilCompleto = false;
    
    // Cargo en CODAR (para usuarios CODAR)
    @Column(name = "cargo_codar", length = 100)
    private String cargoCodar;
    
    // Área de trabajo en CODAR
    @Column(name = "area_codar", length = 100)
    private String areaCodar;
    
    // Fecha de nacimiento
    @Column(name = "fecha_nacimiento")
    private String fechaNacimiento;
    
    // Indicador si es ex-árbitro
    @Column(name = "es_ex_arbitro")
    private Boolean esExArbitro = false;
    
    // Especialidad (para dirigente/ex-árbitro)
    @Column(name = "especialidad", length = 150)
    private String especialidad;
    
    // Fecha de aprobación del usuario
    @Column(name = "fecha_aprobacion")
    private LocalDateTime fechaAprobacion;
    
    // Usuario que aprobó este usuario
    @Column(name = "aprobado_por")
    private Long aprobadoPor;
    
    // Enum para roles jerárquicos con propiedades
    public enum RolUsuario {
        ADMIN(1L, "ADMIN", 1),
        PRESIDENCIA(2L, "PRESIDENCIA", 2),
        UNIDAD_TECNICA(3L, "UNIDAD_TECNICA", 3);
        
        private final Long id;
        private final String nombre;
        private final Integer jerarquia;
        
        RolUsuario(Long id, String nombre, Integer jerarquia) {
            this.id = id;
            this.nombre = nombre;
            this.jerarquia = jerarquia;
        }
        
        public Long getId() {
            return id;
        }
        
        public String getNombre() {
            return nombre;
        }
        
        public Integer getJerarquia() {
            return jerarquia;
        }
    }
    
    // Método auxiliar para verificar permisos
    public boolean tienePermiso(String permiso) {
        if (permisosEspecificos == null || permisosEspecificos.isEmpty()) {
            return false;
        }
        return permisosEspecificos.contains(permiso);
    }
}
