package com.sidaf.backend.repository;

import com.sidaf.backend.model.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {

    List<Asistencia> findByFecha(LocalDate fecha);

    List<Asistencia> findByActividad(String actividad);

    List<Asistencia> findByEstado(String estado);

    List<Asistencia> findByFechaBetween(LocalDate fechaInicio, LocalDate fechaFin);

    List<Asistencia> findByResponsableId(Long responsableId);
}
