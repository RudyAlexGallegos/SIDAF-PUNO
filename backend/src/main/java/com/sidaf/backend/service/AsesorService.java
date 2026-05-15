package com.sidaf.backend.service;

import com.sidaf.backend.model.Asesor;
import com.sidaf.backend.repository.AsesorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class AsesorService {
    
    @Autowired
    private AsesorRepository asesorRepository;
    
    /**
     * Obtener todos los asesores
     */
    public List<Asesor> obtenerTodosAsesores() {
        return asesorRepository.findAll();
    }
    
    /**
     * Obtener asesor por ID
     */
    public Optional<Asesor> obtenerAsesorPorId(Long id) {
        return asesorRepository.findById(id);
    }
    
    /**
     * Obtener asesor por usuario_id
     */
    public Optional<Asesor> obtenerAsesorPorUsuarioId(Long usuarioId) {
        return asesorRepository.findByUsuarioId(usuarioId);
    }
    
    /**
     * Obtener asesor por DNI
     */
    public Optional<Asesor> obtenerAsesorPorDni(String dni) {
        return asesorRepository.findByDni(dni);
    }
    
    /**
     * Obtener todos los asesores activos
     */
    public List<Asesor> obtenerAsesoresActivos() {
        return asesorRepository.findByEstado("ACTIVO");
    }
    
    /**
     * Buscar asesores por nombre o apellido
     */
    public List<Asesor> buscarAsesoresPorNombre(String nombre) {
        return asesorRepository.findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCaseOrderByNombreAsc(
            nombre, nombre
        );
    }
    
    /**
     * Crear nuevo asesor
     */
    public Asesor crearAsesor(Asesor asesor) {
        // Validar que el asesor no exista ya
        if (asesorRepository.findByUsuarioId(asesor.getUsuarioId()).isPresent()) {
            throw new RuntimeException("Ya existe un asesor asociado a este usuario");
        }
        if (asesorRepository.findByDni(asesor.getDni()).isPresent()) {
            throw new RuntimeException("Ya existe un asesor con este DNI");
        }
        if (asesorRepository.findByEmail(asesor.getEmail()).isPresent()) {
            throw new RuntimeException("Ya existe un asesor con este email");
        }
        
        return asesorRepository.save(asesor);
    }
    
    /**
     * Actualizar asesor existente
     */
    public Asesor actualizarAsesor(Long id, Asesor asesorActualizado) {
        return asesorRepository.findById(id)
            .map(asesor -> {
                if (asesorActualizado.getNombre() != null) {
                    asesor.setNombre(asesorActualizado.getNombre());
                }
                if (asesorActualizado.getApellido() != null) {
                    asesor.setApellido(asesorActualizado.getApellido());
                }
                if (asesorActualizado.getEmail() != null) {
                    // Validar que no exista otro asesor con este email
                    Optional<Asesor> existente = asesorRepository.findByEmail(asesorActualizado.getEmail());
                    if (existente.isPresent() && !existente.get().getId().equals(id)) {
                        throw new RuntimeException("Ya existe un asesor con este email");
                    }
                    asesor.setEmail(asesorActualizado.getEmail());
                }
                if (asesorActualizado.getTelefono() != null) {
                    asesor.setTelefono(asesorActualizado.getTelefono());
                }
                if (asesorActualizado.getEspecialidad() != null) {
                    asesor.setEspecialidad(asesorActualizado.getEspecialidad());
                }
                if (asesorActualizado.getEstado() != null) {
                    asesor.setEstado(asesorActualizado.getEstado());
                }
                if (asesorActualizado.getDescripcion() != null) {
                    asesor.setDescripcion(asesorActualizado.getDescripcion());
                }
                if (asesorActualizado.getFoto() != null) {
                    asesor.setFoto(asesorActualizado.getFoto());
                }
                
                return asesorRepository.save(asesor);
            })
            .orElseThrow(() -> new RuntimeException("Asesor no encontrado con ID: " + id));
    }
    
    /**
     * Cambiar estado del asesor
     */
    public Asesor cambiarEstadoAsesor(Long id, String nuevoEstado) {
        return asesorRepository.findById(id)
            .map(asesor -> {
                asesor.setEstado(nuevoEstado);
                return asesorRepository.save(asesor);
            })
            .orElseThrow(() -> new RuntimeException("Asesor no encontrado con ID: " + id));
    }
    
    /**
     * Eliminar asesor
     */
    public void eliminarAsesor(Long id) {
        if (!asesorRepository.existsById(id)) {
            throw new RuntimeException("Asesor no encontrado con ID: " + id);
        }
        asesorRepository.deleteById(id);
    }
    
    /**
     * Contar asesores activos
     */
    public Long contarAsesoresActivos() {
        return asesorRepository.countByEstado("ACTIVO");
    }
}
