package com.sidaf.backend.repository;

import com.sidaf.backend.model.ModelVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ModelVersionRepository extends JpaRepository<ModelVersion, Long> {
    List<ModelVersion> findByTipoModelo(String tipoModelo);
    List<ModelVersion> findByActivoTrue();
    ModelVersion findByTipoModeloAndActivoTrue(String tipoModelo);
}
