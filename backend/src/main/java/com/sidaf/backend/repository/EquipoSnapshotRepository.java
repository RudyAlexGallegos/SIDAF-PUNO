package com.sidaf.backend.repository;

import com.sidaf.backend.model.EquipoSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EquipoSnapshotRepository extends JpaRepository<EquipoSnapshot, Long> {
    List<EquipoSnapshot> findByEquipoId(Integer equipoId);
    List<EquipoSnapshot> findByEquipoIdAndFechaSnapshotBetween(Integer equipoId, LocalDateTime desde, LocalDateTime hasta);
    List<EquipoSnapshot> findByFechaSnapshotBetween(LocalDateTime desde, LocalDateTime hasta);
}
