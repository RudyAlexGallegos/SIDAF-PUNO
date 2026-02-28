package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
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
    private RolUsuario rol = RolUsuario.UNIDAD_TECNICA_CODAR;
    
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
    
    // Enum para roles jerárquicos
    public enum RolUsuario {
        ADMIN,                    // Administrador del sistema (ROOT) - Acceso total
        PRESIDENCIA_CODAR,       // Presidencia CODAR - Gestiona permisos de CODAR
        CODAR,                   // Usuario CODAR - Acceso según permisos asignados
        UNIDAD_TECNICA_CODAR     // Unidad Técnica CODAR - Dirigente/Ex-árbitro
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public RolUsuario getRol() { return rol; }
    public void setRol(RolUsuario rol) { this.rol = rol; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    
    public String getUnidadOrganizacional() { return unidadOrganizacional; }
    public void setUnidadOrganizacional(String unidadOrganizacional) { this.unidadOrganizacional = unidadOrganizacional; }
    
    public String getPermisosEspecificos() { return permisosEspecificos; }
    public void setPermisosEspecificos(String permisosEspecificos) { this.permisosEspecificos = permisosEspecificos; }
    
    public Long getArbitroId() { return arbitroId; }
    public void setArbitroId(Long arbitroId) { this.arbitroId = arbitroId; }
    
    public Long getCreadoPor() { return creadoPor; }
    public void setCreadoPor(Long creadoPor) { this.creadoPor = creadoPor; }
    
    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }
    
    public LocalDateTime getUltimoAcceso() { return ultimoAcceso; }
    public void setUltimoAcceso(LocalDateTime ultimoAcceso) { this.ultimoAcceso = ultimoAcceso; }
    
    public String getFoto() { return foto; }
    public void setFoto(String foto) { this.foto = foto; }
    
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    
    public Boolean getPerfilCompleto() { return perfilCompleto; }
    public void setPerfilCompleto(Boolean perfilCompleto) { this.perfilCompleto = perfilCompleto; }
    
    public String getCargoCodar() { return cargoCodar; }
    public void setCargoCodar(String cargoCodar) { this.cargoCodar = cargoCodar; }
    
    public String getAreaCodar() { return areaCodar; }
    public void setAreaCodar(String areaCodar) { this.areaCodar = areaCodar; }
    
    // Método auxiliar para verificar permisos
    public boolean tienePermiso(String permiso) {
        if (permisosEspecificos == null || permisosEspecificos.isEmpty()) {
            return false;
        }
        return permisosEspecificos.contains(permiso);
    }
}
