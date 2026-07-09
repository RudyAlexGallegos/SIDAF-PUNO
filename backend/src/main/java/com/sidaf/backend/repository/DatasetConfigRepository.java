package com.sidaf.backend.repository;

import com.sidaf.backend.model.DatasetConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DatasetConfigRepository extends JpaRepository<DatasetConfig, Long> {
    List<DatasetConfig> findByActivoTrue();
    List<DatasetConfig> findByCampeonatoId(Long campeonatoId);
    List<DatasetConfig> findByFormatoSalida(String formatoSalida);
}
