package com.sidaf.backend.repository;

import com.sidaf.backend.model.ArbitroDisponibilidad;
import com.sidaf.backend.model.ArbitroDisponibilidad.EstadoBloqueo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ArbitroDisponibilidadRepository extends JpaRepository<ArbitroDisponibilidad, Long> {

    List<ArbitroDisponibilidad> findByFecha(LocalDate fecha);

    List<ArbitroDisponibilidad> findByFechaAndEstado(LocalDate fecha, EstadoBloqueo estado);

    List<ArbitroDisponibilidad> findByArbitroId(Long arbitroId);

    List<ArbitroDisponibilidad> findByDesignacionId(Long designacionId);

    /** Bloqueo ACTIVO de un árbitro en una fecha (a lo sumo uno por el índice único parcial). */
    Optional<ArbitroDisponibilidad> findFirstByArbitroIdAndFechaAndEstado(
            Long arbitroId, LocalDate fecha, EstadoBloqueo estado);

    @Query("SELECT d FROM ArbitroDisponibilidad d " +
           "WHERE d.fecha = :fecha AND d.estado = :estado AND d.arbitroId IN :arbitroIds")
    List<ArbitroDisponibilidad> findActivosByFechaAndArbitros(
            @Param("fecha") LocalDate fecha,
            @Param("estado") EstadoBloqueo estado,
            @Param("arbitroIds") List<Long> arbitroIds);
}
