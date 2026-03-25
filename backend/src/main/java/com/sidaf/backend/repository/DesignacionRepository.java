package com.sidaf.backend.repository;

import com.sidaf.backend.model.Designacion;
import com.sidaf.backend.model.Designacion.EstadoDesignacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DesignacionRepository extends JpaRepository<Designacion, Long> {
    
    List<Designacion> findByIdCampeonato(Long idCampeonato);
    
    List<Designacion> findByEstado(EstadoDesignacion estado);
    
    List<Designacion> findByFecha(String fecha);
    
    List<Designacion> findByArbitroPrincipal(String arbitroPrincipal);
    
    List<Designacion> findByArbitroAsistente1(String arbitroAsistente1);
    
    List<Designacion> findByArbitroAsistente2(String arbitroAsistente2);
    
    List<Designacion> findByCuartoArbitro(String cuartoArbitro);
    
    List<Designacion> findByIdEquipoLocal(Long idEquipoLocal);
    
    List<Designacion> findByIdEquipoVisitante(Long idEquipoVisitante);
}
