package com.sidaf.backend.repository;

import com.sidaf.backend.model.Designacion;
import com.sidaf.backend.model.Designacion.EstadoDesignacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    
    @Query("SELECT d FROM Designacion d WHERE d.fecha = :fecha AND (d.arbitroPrincipal = :arbitroId OR d.arbitroAsistente1 = :arbitroId OR d.arbitroAsistente2 = :arbitroId OR d.cuartoArbitro = :arbitroId OR d.asesor = :arbitroId)")
    List<Designacion> findByFechaAndArbitro(@Param("fecha") String fecha, @Param("arbitroId") String arbitroId);
}
