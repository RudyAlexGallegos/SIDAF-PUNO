package com.sidaf.backend.repository;

import com.sidaf.backend.model.Prediccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PrediccionRepository extends JpaRepository<Prediccion, Long> {
    List<Prediccion> findByModelVersionId(Long modelVersionId);
    List<Prediccion> findByPartidoId(Long partidoId);
    List<Prediccion> findByCampeonatoId(Long campeonatoId);
    List<Prediccion> findByArbitroId(Long arbitroId);
    List<Prediccion> findByFechaPrediccionBetween(java.time.LocalDateTime desde, java.time.LocalDateTime hasta);
}
