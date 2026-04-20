package com.sidaf.backend.service;

import com.sidaf.backend.model.*;
import com.sidaf.backend.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
@Slf4j
public class RolService {
    
    @Autowired
    private RolRepository rolRepository;
    
    @Autowired
    private PermisoRepository permisoRepository;
    
    @Autowired
    private AuditoriaPermisoRepository auditoriaPermisoRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    // ==================== OPERACIONES BASICAS DE ROLES ====================
    
    /**
     * Obtener todos los roles
     */
    public List<Rol> obtenerTodosRoles() {
        return rolRepository.findAll();
    }
    
    /**
     * Obtener rol por nombre
     */
    public Optional<Rol> obtenerRolPorNombre(String nombre) {
        return rolRepository.findByNombre(nombre);
    }
    
    /**
     * Obtener rol por id
     */
    public Optional<Rol> obtenerRolPorId(Long id) {
        return rolRepository.findById(id);
    }
    
    /**
     * Crear nuevo rol
     */
    public Rol crearRol(String nombre, String descripcion, Integer jerarquia) {
        Rol rol = new Rol();
        rol.setNombre(nombre);
        rol.setDescripcion(descripcion);
        rol.setJerarquia(jerarquia);
        rol.setEstado(EstadoRol.ACTIVO);
        rol.setCreatedAt(LocalDateTime.now());
        
        return rolRepository.save(rol);
    }
    
    // ==================== GESTION DE CAMBIOS DE ROL ====================
    
    /**
     * Asignar rol a usuario
     * Solo ADMINISTRADOR puede hacer esto
     */
    public void asignarRolAUsuario(Long usuarioId, String nombreRolNuevo, Long cambiadorPorId, String razon) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Usuario cambiadorPor = usuarioRepository.findById(cambiadorPorId)
            .orElseThrow(() -> new RuntimeException("Usuario que cambia no encontrado"));
        
        // Verificar que quien cambia es ADMINISTRADOR
        if (cambiadorPor.getRol() == null || !cambiadorPor.getRol().getNombre().equals("ADMIN")) {
            throw new RuntimeException("Solo ADMINISTRADOR puede cambiar roles");
        }
        
        String rolAnterior = usuario.getRol() != null ? usuario.getRol().getNombre() : "SIN ROL";
        String rolNuevo = nombreRolNuevo;
        
        // Convertir nombre a enum
        Usuario.RolUsuario nuevoRol;
        try {
            nuevoRol = Usuario.RolUsuario.valueOf(nombreRolNuevo.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Rol inválido: " + nombreRolNuevo);
        }
        
        // Actualizar rol
        usuario.setRol(nuevoRol);
        usuarioRepository.save(usuario);
        
        // Registrar auditoría
        registrarCambioRol(usuario, rolAnterior, rolNuevo, cambiadorPor, razon);
        
        log.info("Rol de usuario {} cambiado de {} a {} por {}", usuario.getDni(), rolAnterior, rolNuevo, cambiadorPor.getDni());
    }
    
    /**
     * Registrar cambio de rol en auditoría
     */
    private void registrarCambioRol(Usuario usuario, String rolAnterior, String rolNuevo, 
                                   Usuario realizadoPor, String razon) {
        AuditoriaPermiso auditoria = new AuditoriaPermiso();
        auditoria.setTipoCambio(TipoCambio.CAMBIO_ROL);
        auditoria.setUsuarioAfectado(usuario);
        auditoria.setRolAnterior(rolAnterior);
        auditoria.setRolNuevo(rolNuevo);
        auditoria.setRealizadoPor(realizadoPor);
        auditoria.setDescripcion("Cambio de rol: " + rolAnterior + " → " + rolNuevo);
        auditoria.setRazon(razon);
        auditoria.setFechaCambio(LocalDateTime.now());
        
        auditoriaPermisoRepository.save(auditoria);
    }
    
    // ==================== GESTION DE PERMISOS DE ROLES ====================
    
    /**
     * Obtener los permisos que tiene un rol por defecto
     */
    public List<Permiso> obtenerPermisosRol(Long rolId) {
        // Aquí podemos hacer una query a la tabla rol_permiso_default
        // Por ahora, retornamos todos los permisos del rol desde la BD
        return permisoRepository.findAll().stream()
            .filter(p -> p.getEstado() == EstadoPermiso.ACTIVO)
            .toList();
    }
    
    // ==================== VALIDACION DE JERARQUIA ====================
    
    /**
     * Obtener nivel de jerarquía de un usuario
     */
    public Integer obtenerJerarquiaUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
        if (usuario == null || usuario.getRol() == null) {
            return 999; // Sin permiso
        }
        return usuario.getRol().getJerarquia();
    }
    
    /**
     * Verificar si usuario1 tiene mayor jerarquía que usuario2
     */
    public boolean tieneJerarquiaMayor(Long usuarioId1, Long usuarioId2) {
        Integer jerarquia1 = obtenerJerarquiaUsuario(usuarioId1);
        Integer jerarquia2 = obtenerJerarquiaUsuario(usuarioId2);
        return jerarquia1 < jerarquia2; // Menor número = mayor jerarquía
    }
}
