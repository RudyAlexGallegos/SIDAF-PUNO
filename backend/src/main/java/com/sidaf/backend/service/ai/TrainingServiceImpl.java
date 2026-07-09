package com.sidaf.backend.service.ai;

import com.sidaf.backend.model.ModelVersion;
import com.sidaf.backend.repository.ModelVersionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class TrainingServiceImpl implements TrainingService {

    @Autowired
    private ModelVersionRepository modelVersionRepository;

    @Override
    public ModelVersion entrenar(String nombre, String version, String tipoModelo, Map<String, Object> parametros) {
        ModelVersion modelo = new ModelVersion();
        modelo.setNombre(nombre);
        modelo.setVersion(version);
        modelo.setTipoModelo(tipoModelo);
        modelo.setDescripcion((String) parametros.getOrDefault("descripcion", ""));
        modelo.setMetricas(new HashMap<>(parametros).toString());
        modelo.setFechaEntrenamiento(LocalDateTime.now());
        modelo.setActivo(true);
        modelVersionRepository.findByTipoModelo(tipoModelo).forEach(m -> {
            m.setActivo(false);
            modelVersionRepository.save(m);
        });
        return modelVersionRepository.save(modelo);
    }

    @Override
    public ModelVersion reentrenar(Long modelVersionId, Map<String, Object> parametros) {
        ModelVersion modelo = modelVersionRepository.findById(modelVersionId)
                .orElseThrow(() -> new IllegalArgumentException("Modelo no encontrado"));
        modelo.setMetricas(new HashMap<>(parametros).toString());
        modelo.setFechaEntrenamiento(LocalDateTime.now());
        return modelVersionRepository.save(modelo);
    }
}
