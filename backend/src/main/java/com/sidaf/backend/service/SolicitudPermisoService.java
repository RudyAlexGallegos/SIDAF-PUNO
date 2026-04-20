package com.sidaf.backend.service;

import com.sidaf.backend.model.SolicitudPermiso;
import com.sidaf.backend.model.Usuario;
import com.sidaf.backend.repository.SolicitudPermisoRepository;
import com.sidaf.backend.repository.UsuarioRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
@Slf4j
public class SolicitudPermisoService {
    
    @Autowired
    private SolicitudPermisoRepository solicitudPermisoRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    // ==================== OPERACIONES BASICAS ====================
    
    /**
     * Obtener todas las solicitudes pendientes
     */
    public List<SolicitudPermiso> obtenerSolicitudesPendientes() {
        log.info("Obteniendo solicitudes pendientes");
        return solicitudPermisoRepository.findByEstadoOrderByFechaSolicitudDesc("PENDIENTE");
    }
    
    /**
     * Obtener solicitudes de un usuario
     */
    public List<SolicitudPermiso> obtenerSolicitudesDelUsuario(Long usuarioId) {
        log.info("Obteniendo solicitudes del usuario: {}", usuarioId);
        return solicitudPermisoRepository.findByUsuarioId(usuarioId);
    }
    
    /**
     * Obtener solicitud por ID
     */
    public Optional<SolicitudPermiso> obtenerSolicitudPorId(Long id) {
        log.info("Obteniendo solicitud con ID: {}", id);
        return solicitudPermisoRepository.findById(id);
    }
    
    /**
     * Crear nueva solicitud de permiso
     */
    public SolicitudPermiso crearSolicitud(SolicitudPermiso solicitud) {
        log.info("Creando nueva solicitud para usuario: {}", solicitud.getUsuarioId());
        
        // Verificar que el usuario existe
        Usuario usuario = usuarioRepository.findById(solicitud.getUsuarioId())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        solicitud.setUsuarioNombre(usuario.getNombre() + " " + usuario.getApellido());
        solicitud.setEstado("PENDIENTE");
        solicitud.setFechaSolicitud(LocalDateTime.now());
        solicitud.setSolicitadoEn(LocalDateTime.now());
        
        SolicitudPermiso guardada = solicitudPermisoRepository.save(solicitud);
        log.info("✅ Solicitud creada con ID: {}", guardada.getId());
        return guardada;
    }
    
    /**
     * Responder a una solicitud (APROBADO o RECHAZADO)
     */
    public SolicitudPermiso responderSolicitud(Long solicitudId, String accion, Long respondidoPor, String razonRechazo) {
        log.info("Respondiendo solicitud {} con acción: {}", solicitudId, accion);
        
        SolicitudPermiso solicitud = solicitudPermisoRepository.findById(solicitudId)
            .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        
        // Validar acción
        if (!("APROBADO".equals(accion) || "RECHAZADO".equals(accion))) {
            throw new RuntimeException("Acción inválida. Debe ser APROBADO o RECHAZADO");
        }
        
        // Verificar que quien responde es ADMIN o PRESIDENCIA (si se proporciona respondidoPor)
        if (respondidoPor != null) {
            Usuario respondedor = usuarioRepository.findById(respondidoPor)
                .orElseThrow(() -> new RuntimeException("Usuario respondedor no encontrado"));
            
            Usuario.RolUsuario rol = respondedor.getRol();
            if (!(Usuario.RolUsuario.ADMIN.equals(rol) || Usuario.RolUsuario.PRESIDENCIA.equals(rol))) {
                throw new RuntimeException("Solo ADMIN o PRESIDENCIA pueden responder solicitudes");
            }
        }
        
        // Actualizar solicitud
        solicitud.setEstado(accion);
        solicitud.setFechaRespuesta(LocalDateTime.now());
        solicitud.setRespondidoEn(LocalDateTime.now());
        
        if (respondidoPor != null) {
            solicitud.setRespondidoPor(respondidoPor);
        }
        
        if ("RECHAZADO".equals(accion)) {
            solicitud.setRazonRechazo(razonRechazo);
        }
        
        SolicitudPermiso actualizada = solicitudPermisoRepository.save(solicitud);
        log.info("✅ Solicitud {} respondida como: {}", solicitudId, accion);
        return actualizada;
    }
    
    /**
     * Obtener solicitudes por estado
     */
    public List<SolicitudPermiso> obtenerSolicitudesPorEstado(String estado) {
        log.info("Obteniendo solicitudes con estado: {}", estado);
        return solicitudPermisoRepository.findByEstado(estado);
    }
    
    /**
     * Eliminar una solicitud
     */
    public void eliminarSolicitud(Long id) {
        log.info("Eliminando solicitud con ID: {}", id);
        solicitudPermisoRepository.deleteById(id);
        log.info("✅ Solicitud eliminada");
    }
}
