package com.sidaf.backend.repository;

import com.sidaf.backend.model.Campeonato;
import com.sidaf.backend.model.Campeonato.EstadoCampeonato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampeonatoRepository extends JpaRepository<Campeonato, Long> {
    
    List<Campeonato> findByEstado(EstadoCampeonato estado);
    
    List<Campeonato> findByNivelDificultad(String nivelDificultad);
    
    List<Campeonato> findByProvincia(String provincia);
    
    List<Campeonato> findByCiudad(String ciudad);
    
    List<Campeonato> findByCategoria(String categoria);
}
