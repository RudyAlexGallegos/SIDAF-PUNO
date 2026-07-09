package com.sidaf.backend.repository;

import com.sidaf.backend.model.PrediccionHistorial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PrediccionHistorialRepository extends JpaRepository<PrediccionHistorial, Long> {
    List<PrediccionHistorial> findByPrediccionId(Long prediccionId);
    List<PrediccionHistorial> findByCampeonatoId(Long campeonatoId);
    List<PrediccionHistorial> findByArbitroId(Long arbitroId);
    List<PrediccionHistorial> findByFechaPrediccionBetween(LocalDateTime desde, LocalDateTime hasta);
    List<PrediccionHistorial> findByFechaResultadoBetween(LocalDateTime desde, LocalDateTime hasta);
}
