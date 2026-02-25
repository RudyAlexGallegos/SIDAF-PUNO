package com.sidaf.backend.repository;

import com.sidaf.backend.model.SolicitudPermiso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudPermisoRepository extends JpaRepository<SolicitudPermiso, Long> {
    List<SolicitudPermiso> findByEstado(String estado);
    List<SolicitudPermiso> findByUsuarioId(Long usuarioId);
    List<SolicitudPermiso> findByEstadoOrderByFechaSolicitudDesc(String estado);
}
