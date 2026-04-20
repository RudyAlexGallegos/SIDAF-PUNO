package com.sidaf.backend.repository;

import com.sidaf.backend.model.UsuarioPermisoDinamico;
import com.sidaf.backend.model.EstadoPermiso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioPermisoDinamicoRepository extends JpaRepository<UsuarioPermisoDinamico, Long> {
    
    /**
     * Obtener todos los permisos dinámicos de un usuario
     */
    List<UsuarioPermisoDinamico> findByUsuarioId(Long usuarioId);
    
    /**
     * Obtener permisos activos de un usuario
     */
    List<UsuarioPermisoDinamico> findByUsuarioIdAndEstado(Long usuarioId, EstadoPermiso estado);
    
    /**
     * Verificar si un usuario tiene un permiso específico
     */
    Optional<UsuarioPermisoDinamico> findByUsuarioIdAndPermisoId(Long usuarioId, Long permisoId);
    
    /**
     * Buscar permiso específico activo
     */
    Optional<UsuarioPermisoDinamico> findByUsuarioIdAndPermisoIdAndEstado(Long usuarioId, Long permisoId, EstadoPermiso estado);
    
    /**
     * Eliminar permiso dinámico de un usuario
     */
    void deleteByUsuarioIdAndPermisoId(Long usuarioId, Long permisoId);
    
    /**
     * Obtener todos los permisos de un usuario incluyendo el rol
     */
    @Query(value = """
        SELECT upd.* FROM usuario_permiso_dinamico upd
        WHERE upd.usuario_id = :usuarioId AND upd.estado = 'ACTIVO'
        """, nativeQuery = true)
    List<UsuarioPermisoDinamico> findAllActivePermisosForUsuario(@Param("usuarioId") Long usuarioId);
}
