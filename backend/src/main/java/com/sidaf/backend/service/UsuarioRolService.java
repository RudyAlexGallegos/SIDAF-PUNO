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
public class UsuarioRolService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private RolRepository rolRepository;
    
    @Autowired
    private PermisoService permisoService;
    
    @Autowired
    private RolService rolService;
    
    @Autowired
    private UsuarioPermisoDinamicoRepository usuarioPermisoDinamicoRepository;
    
    @Autowired
    private SolicitudPermisoRepository solicitudPermisoRepository;
    
    @Autowired
    private AuditoriaPermisoRepository auditoriaPermisoRepository;
    
    // ==================== OPERACIONES DE USUARIOS CON ROLES ====================
    
    /**
     * Obtener datos completos de usuario con su rol y permisos
     */
    public Map<String, Object> obtenerInfoUsuarioCompleta(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Map<String, Object> info = new HashMap<>();
        info.put("id", usuario.getId());
        info.put("dni", usuario.getDni());
        info.put("nombre", usuario.getNombre());
        info.put("apellido", usuario.getApellido());
        info.put("email", usuario.getEmail());
        info.put("estado", usuario.getEstado());
        
        if (usuario.getRol() != null) {
            Map<String, Object> rolInfo = new HashMap<>();
            rolInfo.put("id", usuario.getRol().getId());
            rolInfo.put("nombre", usuario.getRol().getNombre());
            rolInfo.put("jerarquia", usuario.getRol().getJerarquia());
            info.put("rol", rolInfo);
        }
        
        // Permisos
        List<Permiso> permisos = permisoService.obtenerPermisosDelUsuario(usuarioId);
        List<Map<String, Object>> permisosInfo = new ArrayList<>();
        for (Permiso p : permisos) {
            Map<String, Object> pInfo = new HashMap<>();
            pInfo.put("id", p.getId());
            pInfo.put("codigo", p.getCodigo());
            pInfo.put("nombre", p.getNombre());
            pInfo.put("modulo", p.getModulo());
            pInfo.put("accion", p.getAccion());
            permisosInfo.add(pInfo);
        }
        info.put("permisos", permisosInfo);
        
        return info;
    }
    
    /**
     * Aprobar usuario que está en estado PENDIENTE
     * Transiciona de PENDIENTE → ACTIVO
     */
    public Usuario aprobarUsuario(Long usuarioId, Long aprobadoPorId, String razon) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Usuario aprobadoPor = usuarioRepository.findById(aprobadoPorId)
            .orElseThrow(() -> new RuntimeException("Usuario que aprueba no encontrado"));
        
        // Verificar que quien aprueba es PRESIDENCIA o ADMINISTRADOR
        if (aprobadoPor.getRol() == null) {
            throw new RuntimeException("Usuario sin rol asignado");
        }
        String rolAprobador = aprobadoPor.getRol().getNombre();
        if (!rolAprobador.equals("PRESIDENCIA") && !rolAprobador.equals("ADMINISTRADOR")) {
            throw new RuntimeException("Solo PRESIDENCIA o ADMINISTRADOR puede aprobar usuarios");
        }
        
        // Verificar que usuario está PENDIENTE
        if (!"PENDIENTE".equals(usuario.getEstado())) {
            throw new RuntimeException("Usuario no está en estado PENDIENTE");
        }
        
        // Cambiar estado a ACTIVO
        String estadoAnterior = usuario.getEstado();
        usuario.setEstado("ACTIVO");
        usuario.setFechaAprobacion(LocalDateTime.now());
        usuario.setAprobadoPor(aprobadoPor.getId());
        
        Usuario usuarioActualizado = usuarioRepository.save(usuario);
        
        // Registrar en auditoría
        AuditoriaPermiso auditoria = new AuditoriaPermiso();
        auditoria.setTipoCambio(TipoCambio.USUARIO_APROBADO);
        auditoria.setUsuarioAfectado(usuario);
        auditoria.setRealizadoPor(aprobadoPor);
        auditoria.setDescripcion("Usuario aprobado - Cambio de estado: " + estadoAnterior + " → ACTIVO");
        auditoria.setRazon(razon);
        auditoria.setFechaCambio(LocalDateTime.now());
        auditoriaPermisoRepository.save(auditoria);
        
        log.info("Usuario {} aprobado por {} - Razón: {}", usuario.getDni(), aprobadoPor.getDni(), razon);
        
        return usuarioActualizado;
    }
    
    /**
     * Rechazar usuario que está en estado PENDIENTE
     */
    public Usuario rechazarUsuario(Long usuarioId, Long rechazadoPorId, String razonRechazo) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Usuario rechazadoPor = usuarioRepository.findById(rechazadoPorId)
            .orElseThrow(() -> new RuntimeException("Usuario que rechaza no encontrado"));
        
        // Verificar que quien rechaza es PRESIDENCIA o ADMINISTRADOR
        if (rechazadoPor.getRol() == null) {
            throw new RuntimeException("Usuario sin rol asignado");
        }
        String rolRechazador = rechazadoPor.getRol().getNombre();
        if (!rolRechazador.equals("PRESIDENCIA") && !rolRechazador.equals("ADMINISTRADOR")) {
            throw new RuntimeException("Solo PRESIDENCIA o ADMINISTRADOR puede rechazar usuarios");
        }
        
        // Verificar que usuario está PENDIENTE
        if (!"PENDIENTE".equals(usuario.getEstado())) {
            throw new RuntimeException("Usuario no está en estado PENDIENTE");
        }
        
        // Cambiar estado a INACTIVO
        usuario.setEstado("INACTIVO");
        Usuario usuarioActualizado = usuarioRepository.save(usuario);
        
        // Registrar en auditoría
        AuditoriaPermiso auditoria = new AuditoriaPermiso();
        auditoria.setTipoCambio(TipoCambio.USUARIO_RECHAZADO);
        auditoria.setUsuarioAfectado(usuario);
        auditoria.setRealizadoPor(rechazadoPor);
        auditoria.setDescripcion("Usuario rechazado - Cambio de estado: PENDIENTE → INACTIVO");
        auditoria.setRazon(razonRechazo);
        auditoria.setFechaCambio(LocalDateTime.now());
        auditoriaPermisoRepository.save(auditoria);
        
        log.info("Usuario {} rechazado por {} - Razón: {}", usuario.getDni(), rechazadoPor.getDni(), razonRechazo);
        
        return usuarioActualizado;
    }
    
    /**
     * Obtener todos los usuarios pendientes de aprobación
     */
    public List<Usuario> obtenerUsuariosPendientes() {
        return usuarioRepository.findAll().stream()
            .filter(u -> "PENDIENTE".equals(u.getEstado()))
            .toList();
    }
    
    /**
     * Obtener usuarios por rol
     */
    public List<Usuario> obtenerUsuariosPorRol(String nombreRol) {
        Optional<Rol> rol = rolRepository.findByNombre(nombreRol);
        if (rol.isEmpty()) {
            return new ArrayList<>();
        }
        
        return usuarioRepository.findAll().stream()
            .filter(u -> u.getRol() != null && u.getRol().getId().equals(rol.get().getId()))
            .toList();
    }
    
    // ==================== GESTIÓN DE SOLICITUDES DE PERMISOS ====================
    
    /**
     * Crear solicitud de permiso adicional
     */
    public SolicitudPermiso crearSolicitudPermiso(Long usuarioId, String permisoSolicitado, String descripcion) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        SolicitudPermiso solicitud = new SolicitudPermiso();
        solicitud.setUsuarioId(usuarioId);
        solicitud.setUsuarioNombre(usuario.getNombre() + " " + usuario.getApellido());
        solicitud.setPermisoSolicitado(permisoSolicitado);
        solicitud.setDescripcion(descripcion);
        solicitud.setEstado("PENDIENTE");
        solicitud.setFechaSolicitud(LocalDateTime.now());
        solicitud.setSolicitadoEn(LocalDateTime.now());
        
        return solicitudPermisoRepository.save(solicitud);
    }
    
    /**
     * Obtener solicitudes pendientes
     */
    public List<SolicitudPermiso> obtenerSolicitudesPendientes() {
        return solicitudPermisoRepository.findAll().stream()
            .filter(s -> "PENDIENTE".equals(s.getEstado()))
            .toList();
    }
    
    /**
     * Aprobar solicitud de permiso
     */
    public SolicitudPermiso aprobarSolicitudPermiso(Long solicitudId, Long aprobadoPorId, String razon) {
        SolicitudPermiso solicitud = solicitudPermisoRepository.findById(solicitudId)
            .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        Usuario aprobadoPor = usuarioRepository.findById(aprobadoPorId)
            .orElseThrow(() -> new RuntimeException("Usuario que aprueba no encontrado"));
        
        // Verificar que quien aprueba es PRESIDENCIA
        if (aprobadoPor.getRol() == null || !aprobadoPor.getRol().getNombre().equals("PRESIDENCIA")) {
            throw new RuntimeException("Solo PRESIDENCIA puede aprobar solicitudes de permisos");
        }
        
        // Actualizar solicitud
        solicitud.setEstado("APROBADA");
        solicitud.setRespondidoEn(LocalDateTime.now());
        solicitud.setRespondidoPor(aprobadoPorId);
        SolicitudPermiso solicitudActualizada = solicitudPermisoRepository.save(solicitud);
        
        log.info("Solicitud de permiso {} aprobada por {}", solicitudId, aprobadoPor.getDni());
        
        return solicitudActualizada;
    }
    
    /**
     * Rechazar solicitud de permiso
     */
    public SolicitudPermiso rechazarSolicitudPermiso(Long solicitudId, Long rechazadoPorId, String razonRechazo) {
        SolicitudPermiso solicitud = solicitudPermisoRepository.findById(solicitudId)
            .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        Usuario rechazadoPor = usuarioRepository.findById(rechazadoPorId)
            .orElseThrow(() -> new RuntimeException("Usuario que rechaza no encontrado"));
        
        // Verificar que quien rechaza es PRESIDENCIA
        if (rechazadoPor.getRol() == null || !rechazadoPor.getRol().getNombre().equals("PRESIDENCIA")) {
            throw new RuntimeException("Solo PRESIDENCIA puede rechazar solicitudes de permisos");
        }
        
        // Actualizar solicitud
        solicitud.setEstado("RECHAZADA");
        solicitud.setRespondidoEn(LocalDateTime.now());
        solicitud.setRespondidoPor(rechazadoPorId);
        solicitud.setRazonRechazo(razonRechazo);
        
        return solicitudPermisoRepository.save(solicitud);
    }
}
