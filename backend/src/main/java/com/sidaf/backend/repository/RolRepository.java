package com.sidaf.backend.repository;

import com.sidaf.backend.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {
    
    /**
     * Buscar rol por nombre
     */
    Optional<Rol> findByNombre(String nombre);
    
    /**
     * Buscar rol por jerarquía
     */
    Optional<Rol> findByJerarquia(Integer jerarquia);
}
