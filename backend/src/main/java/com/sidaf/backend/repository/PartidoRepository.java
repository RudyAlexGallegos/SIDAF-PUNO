package com.sidaf.backend.repository;

import com.sidaf.backend.model.EstadoPartido;
import com.sidaf.backend.model.Partido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PartidoRepository extends JpaRepository<Partido, Long> {
    List<Partido> findByCampeonatoId(Long campeonatoId);
    List<Partido> findByEtapaId(Long etapaId);
    List<Partido> findByEstado(EstadoPartido estado);
    List<Partido> findByCampeonatoIdAndEstado(Long campeonatoId, EstadoPartido estado);
    List<Partido> findByEquipoLocalIdOrEquipoVisitanteId(Long equipoLocalId, Long equipoVisitanteId);
    List<Partido> findByFecha(String fecha);
}
