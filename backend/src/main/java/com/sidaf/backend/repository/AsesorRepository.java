package com.sidaf.backend.repository;

import com.sidaf.backend.model.Asesor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AsesorRepository extends JpaRepository<Asesor, Long> {
    
    // Buscar asesor por usuario_id
    Optional<Asesor> findByUsuarioId(Long usuarioId);
    
    // Buscar asesor por DNI
    Optional<Asesor> findByDni(String dni);
    
    // Buscar asesor por email
    Optional<Asesor> findByEmail(String email);
    
    // Listar todos los asesores activos
    List<Asesor> findByEstado(String estado);
    
    // Buscar asesores que contengan nombre o apellido
    List<Asesor> findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCaseOrderByNombreAsc(
        String nombre, String apellido
    );
    
    // Contar asesores por estado
    Long countByEstado(String estado);
}
