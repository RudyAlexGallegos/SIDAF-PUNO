package com.sidaf.backend.repository;

import com.sidaf.backend.model.CampeonatoSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CampeonatoSnapshotRepository extends JpaRepository<CampeonatoSnapshot, Long> {
    List<CampeonatoSnapshot> findByCampeonatoId(Long campeonatoId);
    List<CampeonatoSnapshot> findByCampeonatoIdAndFechaSnapshotBetween(Long campeonatoId, LocalDateTime desde, LocalDateTime hasta);
    List<CampeonatoSnapshot> findByFechaSnapshotBetween(LocalDateTime desde, LocalDateTime hasta);
}
