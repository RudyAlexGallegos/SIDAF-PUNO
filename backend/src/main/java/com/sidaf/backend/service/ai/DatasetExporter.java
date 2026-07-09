package com.sidaf.backend.service.ai;

import com.sidaf.backend.model.DatasetConfig;
import com.sidaf.backend.repository.DatasetConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DatasetExporter {

    @Autowired
    private DatasetConfigRepository datasetConfigRepository;

    public List<DatasetConfig> obtenerConfiguracionesActivas() {
        return datasetConfigRepository.findByActivoTrue();
    }

    public DatasetConfig crearConfiguracion(DatasetConfig config) {
        config.setActivo(true);
        return datasetConfigRepository.save(config);
    }

    public List<DatasetConfig> obtenerPorFormato(String formato) {
        return datasetConfigRepository.findByFormatoSalida(formato);
    }
}
