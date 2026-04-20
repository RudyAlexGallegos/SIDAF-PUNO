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
public class PermisoService {
    
    @Autowired
    private PermisoRepository permisoRepository;
    
    @Autowired
    private UsuarioPermisoDinamicoRepository usuarioPermisoDinamicoRepository;
    
    @Autowired
    private AuditoriaPermisoRepository auditoriaPermisoRepository;
    
    @Autowired
    private RolRepository rolRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    // ==================== OPERACIONES BASICAS DE PERMISOS ====================
    
    /**
     * Obtener todos los permisos activos
     */
    public List<Permiso> obtenerTodosPermisos() {
        return permisoRepository.findByEstadoOrderByModuloAsc(EstadoPermiso.ACTIVO);
    }
    
    /**
     * Obtener permisos por módulo
     */
    public List<Permiso> obtenerPermisosPorModulo(String modulo) {
        return permisoRepository.findByModulo(modulo);
    }
    
    /**
     * Obtener permisos por código
     */
    public Optional<Permiso> obtenerPermisoPorCodigo(String codigo) {
        return permisoRepository.findByCodigo(codigo);
    }
    
    /**
     * Crear nuevo permiso
     */
    public Permiso crearPermiso(Permiso permiso) {
        permiso.setEstado(EstadoPermiso.ACTIVO);
        permiso.setCreatedAt(LocalDateTime.now());
        return permisoRepository.save(permiso);
    }
    
    // ==================== ASIGNACION DE PERMISOS DINAMICOS ====================
    
    /**
     * Asignar permiso dinámico a un usuario
     * Registra auditoría automáticamente
     */
    public UsuarioPermisoDinamico asignarPermisoAUsuario(Long usuarioId, Long permisoId, Long asignadoPorId, String razon) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Usuario asignadoPor = usuarioRepository.findById(asignadoPorId)
            .orElseThrow(() -> new RuntimeException("Usuario que asigna no encontrado"));
        Permiso permiso = permisoRepository.findById(permisoId)
            .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));
        
        // Verificar que quien asigna es PRESIDENCIA
        if (!esPresidencia(asignadoPor)) {
            throw new RuntimeException("Solo PRESIDENCIA puede asignar permisos dinámicos");
        }
        
        // Verificar que el usuario no sea ADMINISTRADOR
        if (esAdministrador(usuario)) {
            throw new RuntimeException("No se pueden asignar permisos dinámicos a ADMINISTRADOR");
        }
        
        // Crear asignación de permiso
        UsuarioPermisoDinamico upd = new UsuarioPermisoDinamico();
        upd.setUsuario(usuario);
        upd.setPermiso(permiso);
        upd.setAsignadoPor(asignadoPor);
        upd.setEstado(EstadoPermiso.ACTIVO);
        upd.setFechaAsignacion(LocalDateTime.now());
        
        UsuarioPermisoDinamico resultado = usuarioPermisoDinamicoRepository.save(upd);
        
        // Registrar auditoría
        registrarAuditoria(TipoCambio.ASIGNACIÓN, usuario, permiso, asignadoPor, razon);
        
        log.info("Permiso {} asignado al usuario {} por {}", permiso.getCodigo(), usuario.getDni(), asignadoPor.getDni());
        
        return resultado;
    }
    
    /**
     * Revocar permiso dinámico
     */
    public void revocarPermiso(Long usuarioId, Long permisoId, Long revocadoPorId, String razon) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Usuario revocadoPor = usuarioRepository.findById(revocadoPorId)
            .orElseThrow(() -> new RuntimeException("Usuario que revoca no encontrado"));
        Permiso permiso = permisoRepository.findById(permisoId)
            .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));
        
        // Verificar que quien revoca es ADMINISTRADOR o PRESIDENCIA
        if (!esAdminOPresidencia(revocadoPor)) {
            throw new RuntimeException("Solo ADMINISTRADOR o PRESIDENCIA puede revocar permisos");
        }
        
        UsuarioPermisoDinamico upd = usuarioPermisoDinamicoRepository
            .findByUsuarioIdAndPermisoId(usuarioId, permisoId)
            .orElseThrow(() -> new RuntimeException("Permiso no asignado al usuario"));
        
        upd.setEstado(EstadoPermiso.REVOCADO);
        usuarioPermisoDinamicoRepository.save(upd);
        
        // Registrar auditoría
        registrarAuditoria(TipoCambio.REVOCACIÓN, usuario, permiso, revocadoPor, razon);
        
        log.info("Permiso {} revocado al usuario {} por {}", permiso.getCodigo(), usuario.getDni(), revocadoPor.getDni());
    }
    
    // ==================== VALIDACION DE PERMISOS ====================
    
    /**
     * Verificar si un usuario tiene un permiso específico
     */
    public boolean tienePermiso(Long usuarioId, String codigoPermiso) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
        if (usuario == null) return false;
        
        // ADMINISTRADOR tiene todos los permisos
        if (esAdministrador(usuario)) {
            return true;
        }
        
        // Buscar en permisos dinámicos
        Optional<Permiso> permiso = permisoRepository.findByCodigo(codigoPermiso);
        if (permiso.isEmpty()) {
            return false;
        }
        
        Optional<UsuarioPermisoDinamico> upd = usuarioPermisoDinamicoRepository
            .findByUsuarioIdAndPermisoIdAndEstado(usuarioId, permiso.get().getId(), EstadoPermiso.ACTIVO);
        
        return upd.isPresent();
    }
    
    /**
     * Verificar si usuario tiene algún permiso en una lista
     */
    public boolean tieneAlgunPermiso(Long usuarioId, List<String> codigosPermiso) {
        for (String codigo : codigosPermiso) {
            if (tienePermiso(usuarioId, codigo)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Obtener todos los permisos activos de un usuario
     */
    public List<Permiso> obtenerPermisosDelUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
        if (usuario == null) {
            return new ArrayList<>();
        }
        
        // Si es ADMINISTRADOR, retornar todos los permisos
        if (esAdministrador(usuario)) {
            return permisoRepository.findByEstadoOrderByModuloAsc(EstadoPermiso.ACTIVO);
        }
        
        // Obtener permisos dinámicos
        List<UsuarioPermisoDinamico> permisosDinamicos = usuarioPermisoDinamicoRepository
            .findByUsuarioIdAndEstado(usuarioId, EstadoPermiso.ACTIVO);
        
        List<Permiso> permisos = new ArrayList<>();
        for (UsuarioPermisoDinamico upd : permisosDinamicos) {
            permisos.add(upd.getPermiso());
        }
        
        return permisos;
    }
    
    /**
     * Verificar si usuario puede acceder a un módulo
     */
    public boolean puedeAccederModulo(Long usuarioId, String modulo) {
        List<Permiso> permisos = obtenerPermisosDelUsuario(usuarioId);
        return permisos.stream()
            .anyMatch(p -> p.getModulo().equals(modulo) && p.getEstado() == EstadoPermiso.ACTIVO);
    }
    
    // ==================== AUDITORIA ====================
    
    /**
     * Registrar cambio en auditoría
     */
    private void registrarAuditoria(TipoCambio tipoCambio, Usuario usuario, Permiso permiso, 
                                   Usuario realizadoPor, String razon) {
        AuditoriaPermiso auditoria = new AuditoriaPermiso();
        auditoria.setTipoCambio(tipoCambio);
        auditoria.setUsuario(realizadoPor);
        auditoria.setUsuarioAfectado(usuario);
        auditoria.setPermiso(permiso);
        auditoria.setRealizadoPor(realizadoPor);
        auditoria.setFechaCambio(LocalDateTime.now());
        auditoria.setDescripcion("Cambio de permiso: " + permiso.getCodigo());
        auditoria.setRazon(razon);
        
        auditoriaPermisoRepository.save(auditoria);
    }
    
    /**
     * Registrar cambio de estado de usuario
     */
    public void registrarCambioEstado(Usuario usuario, String estadoAnterior, String estadoNuevo, 
                                     Usuario realizadoPor, String razon) {
        AuditoriaPermiso auditoria = new AuditoriaPermiso();
        auditoria.setTipoCambio(TipoCambio.CAMBIO_ESTADO);
        auditoria.setUsuarioAfectado(usuario);
        auditoria.setRealizadoPor(realizadoPor);
        auditoria.setDescripcion("Cambio de estado: " + estadoAnterior + " → " + estadoNuevo);
        auditoria.setRazon(razon);
        auditoria.setFechaCambio(LocalDateTime.now());
        
        auditoriaPermisoRepository.save(auditoria);
    }
    
    /**
     * Obtener auditoría de un usuario
     */
    public List<AuditoriaPermiso> obtenerAuditoriaUsuario(Long usuarioId) {
        return auditoriaPermisoRepository.findByUsuarioIdOrderByFechaCambioDesc(usuarioId);
    }
    
    // ==================== UTILIDADES ====================
    
    /**
     * Verificar si usuario es ADMINISTRADOR
     */
    private boolean esAdministrador(Usuario usuario) {
        return usuario.getRol() != null && usuario.getRol().getNombre().equals("ADMINISTRADOR");
    }
    
    /**
     * Verificar si usuario es PRESIDENCIA
     */
    private boolean esPresidencia(Usuario usuario) {
        return usuario.getRol() != null && usuario.getRol().getNombre().equals("PRESIDENCIA");
    }
    
    /**
     * Verificar si es ADMIN o PRESIDENCIA
     */
    private boolean esAdminOPresidencia(Usuario usuario) {
        return esAdministrador(usuario) || esPresidencia(usuario);
    }
}
