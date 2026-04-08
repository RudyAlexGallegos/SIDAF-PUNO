package com.sidaf.backend.repository;

import com.sidaf.backend.model.CopaPeruResultado;
import com.sidaf.backend.model.Campeonato;
import com.sidaf.backend.model.Equipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CopaPeruResultadoRepository extends JpaRepository<CopaPeruResultado, Long> {
    
    // Buscar resultados por campeonato y etapa
    List<CopaPeruResultado> findByCampeonatoAndEtapa(Campeonato campeonato, String etapa);
    
    // Buscar campeón y subcampeón de una etapa específica
    List<CopaPeruResultado> findByCampeonatoAndEtapaOrderByPosicion(Campeonato campeonato, String etapa);
    
    // Buscar si un equipo es campeón o subcampeón en una etapa
    Optional<CopaPeruResultado> findByCampeonatoAndEtapaAndEquipo(Campeonato campeonato, String etapa, Equipo equipo);
    
    // Buscar todos los resultados de un campeonato
    List<CopaPeruResultado> findByCampeonato(Campeonato campeonato);
    
    // Buscar resultados de una etapa específica
    List<CopaPeruResultado> findByEtapa(String etapa);
    
    // Verificar si un equipo ya es campeón/subcampeón
    List<CopaPeruResultado> findByCampeonatoAndEquipo(Campeonato campeonato, Equipo equipo);
}
