package com.sidaf.backend.repository;

import com.sidaf.backend.model.ArbitroSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ArbitroSnapshotRepository extends JpaRepository<ArbitroSnapshot, Long> {
    List<ArbitroSnapshot> findByArbitroId(Long arbitroId);
    List<ArbitroSnapshot> findByArbitroIdAndFechaSnapshotBetween(Long arbitroId, LocalDateTime desde, LocalDateTime hasta);
    List<ArbitroSnapshot> findByFechaSnapshotBetween(LocalDateTime desde, LocalDateTime hasta);
}
