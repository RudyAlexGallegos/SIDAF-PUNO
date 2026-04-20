package com.sidaf.backend.repository;

import com.sidaf.backend.model.Permiso;
import com.sidaf.backend.model.EstadoPermiso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface PermisoRepository extends JpaRepository<Permiso, Long> {
    
    /**
     * Buscar permiso por código único
     */
    Optional<Permiso> findByCodigo(String codigo);
    
    /**
     * Buscar permisos por módulo
     */
    List<Permiso> findByModulo(String modulo);
    
    /**
     * Buscar permisos por estado
     */
    List<Permiso> findByEstado(EstadoPermiso estado);
    
    /**
     * Buscar permisos por módulo y acción
     */
    Optional<Permiso> findByModuloAndAccion(String modulo, String accion);
    
    /**
     * Buscar todos los permisos activos
     */
    List<Permiso> findByEstadoOrderByModuloAsc(EstadoPermiso estado);
}
