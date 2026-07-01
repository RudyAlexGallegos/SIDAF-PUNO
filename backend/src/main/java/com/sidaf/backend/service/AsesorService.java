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
        if (asesor == null) {
            throw new RuntimeException("Los datos del asesor son obligatorios");
        }

        String nombre = normalizarTexto(asesor.getNombre());
        String apellido = normalizarTexto(asesor.getApellido());
        String dni = normalizarTexto(asesor.getDni());
        String email = normalizarTexto(asesor.getEmail());

        if (nombre.isEmpty() || apellido.isEmpty() || dni.isEmpty() || email.isEmpty()) {
            throw new RuntimeException("Nombre, apellido, DNI y email son obligatorios");
        }

        if (asesor.getUsuarioId() == null || asesor.getUsuarioId() <= 0) {
            throw new RuntimeException("El usuario asociado es obligatorio");
        }

        if (asesorRepository.findByUsuarioId(asesor.getUsuarioId()).isPresent()) {
            throw new RuntimeException("Ya existe un asesor asociado a este usuario");
        }
        if (asesorRepository.findByDni(dni).isPresent()) {
            throw new RuntimeException("Ya existe un asesor con este DNI");
        }
        if (asesorRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Ya existe un asesor con este email");
        }

        asesor.setNombre(nombre);
        asesor.setApellido(apellido);
        asesor.setDni(dni);
        asesor.setEmail(email);
        asesor.setEstado(normalizarTexto(asesor.getEstado()).isEmpty() ? "ACTIVO" : asesor.getEstado().trim().toUpperCase());

        return asesorRepository.save(asesor);
    }
    
    /**
     * Actualizar asesor existente
     */
    public Asesor actualizarAsesor(Long id, Asesor asesorActualizado) {
        return asesorRepository.findById(id)
            .map(asesor -> {
                if (asesorActualizado.getNombre() != null) {
                    String nombre = normalizarTexto(asesorActualizado.getNombre());
                    if (nombre.isEmpty()) {
                        throw new RuntimeException("El nombre no puede estar vacío");
                    }
                    asesor.setNombre(nombre);
                }
                if (asesorActualizado.getApellido() != null) {
                    String apellido = normalizarTexto(asesorActualizado.getApellido());
                    if (apellido.isEmpty()) {
                        throw new RuntimeException("El apellido no puede estar vacío");
                    }
                    asesor.setApellido(apellido);
                }
                if (asesorActualizado.getDni() != null) {
                    String dni = normalizarTexto(asesorActualizado.getDni());
                    if (dni.isEmpty()) {
                        throw new RuntimeException("El DNI no puede estar vacío");
                    }
                    Optional<Asesor> existenteDni = asesorRepository.findByDni(dni);
                    if (existenteDni.isPresent() && !existenteDni.get().getId().equals(id)) {
                        throw new RuntimeException("Ya existe un asesor con este DNI");
                    }
                    asesor.setDni(dni);
                }
                if (asesorActualizado.getEmail() != null) {
                    String email = normalizarTexto(asesorActualizado.getEmail());
                    if (email.isEmpty()) {
                        throw new RuntimeException("El email no puede estar vacío");
                    }
                    Optional<Asesor> existenteEmail = asesorRepository.findByEmail(email);
                    if (existenteEmail.isPresent() && !existenteEmail.get().getId().equals(id)) {
                        throw new RuntimeException("Ya existe un asesor con este email");
                    }
                    asesor.setEmail(email);
                }
                if (asesorActualizado.getTelefono() != null) {
                    asesor.setTelefono(asesorActualizado.getTelefono());
                }
                if (asesorActualizado.getEspecialidad() != null) {
                    asesor.setEspecialidad(asesorActualizado.getEspecialidad());
                }
                if (asesorActualizado.getEstado() != null) {
                    asesor.setEstado(normalizarTexto(asesorActualizado.getEstado()).isEmpty() ? "ACTIVO" : asesorActualizado.getEstado().trim().toUpperCase());
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

    private String normalizarTexto(String valor) {
        return valor == null ? "" : valor.trim();
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
