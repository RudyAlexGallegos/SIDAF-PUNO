package com.sidaf.backend.repository;

import com.sidaf.backend.model.ObservacionPartido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ObservacionPartidoRepository extends JpaRepository<ObservacionPartido, Long> {
    List<ObservacionPartido> findByPartidoId(Long partidoId);
    List<ObservacionPartido> findByDesignacionId(Long designacionId);
    List<ObservacionPartido> findByUsuarioId(Long usuarioId);
}
