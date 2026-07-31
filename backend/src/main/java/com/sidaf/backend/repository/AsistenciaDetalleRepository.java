package com.sidaf.backend.repository;

import com.sidaf.backend.model.AsistenciaDetalle;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AsistenciaDetalleRepository extends JpaRepository<AsistenciaDetalle, Long> {

    List<AsistenciaDetalle> findByAsistenciaId(Long asistenciaId);

    List<AsistenciaDetalle> findByAsistenciaIdAndArbitroId(Long asistenciaId, Long arbitroId);

    void deleteByAsistenciaId(Long asistenciaId);

    @Modifying
    @Query("DELETE FROM AsistenciaDetalle d WHERE d.asistenciaId = :asistenciaId")
    void deleteAllByAsistenciaId(@Param("asistenciaId") Long asistenciaId);
}
