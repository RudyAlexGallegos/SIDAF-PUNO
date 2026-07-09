package com.sidaf.backend.repository;

import com.sidaf.backend.model.EtapaCampeonato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EtapaCampeonatoRepository extends JpaRepository<EtapaCampeonato, Long> {
    List<EtapaCampeonato> findByCampeonatoId(Long campeonatoId);
    List<EtapaCampeonato> findByCampeonatoIdAndActiva(Long campeonatoId, Boolean activa);
    EtapaCampeonato findByCampeonatoIdAndNombre(Long campeonatoId, String nombre);
}
