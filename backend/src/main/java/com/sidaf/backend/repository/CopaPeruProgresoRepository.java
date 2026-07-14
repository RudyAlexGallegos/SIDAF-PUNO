package com.sidaf.backend.repository;

import com.sidaf.backend.model.CopaPeruProgreso;
import com.sidaf.backend.model.Campeonato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CopaPeruProgresoRepository extends JpaRepository<CopaPeruProgreso, Long> {

    List<CopaPeruProgreso> findByCampeonato(Campeonato campeonato);

    List<CopaPeruProgreso> findByCampeonatoAndEtapa(Campeonato campeonato, String etapa);

    Optional<CopaPeruProgreso> findByCampeonatoAndEtapaAndProvinciaAndDistrito(
            Campeonato campeonato, String etapa, String provincia, String distrito);

    void deleteByCampeonatoAndEtapa(Campeonato campeonato, String etapa);
}
