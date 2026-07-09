package com.sidaf.backend.repository;

import com.sidaf.backend.model.Evaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EvaluacionRepository extends JpaRepository<Evaluacion, Long> {
    List<Evaluacion> findByDesignacionId(Long designacionId);
    List<Evaluacion> findByArbitroId(Long arbitroId);
    List<Evaluacion> findByCampeonatoId(Long campeonatoId);
    List<Evaluacion> findByCampeonatoIdAndEtapa(Long campeonatoId, String etapa);
    List<Evaluacion> findByArbitroIdAndCampeonatoId(Long arbitroId, Long campeonatoId);
}
