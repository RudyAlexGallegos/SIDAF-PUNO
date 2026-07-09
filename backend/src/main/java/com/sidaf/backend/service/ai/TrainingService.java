package com.sidaf.backend.service.ai;

import com.sidaf.backend.model.ModelVersion;
import java.util.Map;

public interface TrainingService {
    ModelVersion entrenar(String nombre, String version, String tipoModelo, Map<String, Object> parametros);
    ModelVersion reentrenar(Long modelVersionId, Map<String, Object> parametros);
}
