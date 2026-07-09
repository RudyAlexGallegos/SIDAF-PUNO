package com.sidaf.backend.service.ai;

import com.sidaf.backend.model.Prediccion;
import com.sidaf.backend.model.ModelVersion;
import java.util.List;
import java.util.Map;

public interface PredictionService {
    Prediccion predecir(Long campeonatoId, Long arbitroId, Map<String, Object> contexto);
    List<Prediccion> predecirLote(Long campeonatoId, List<Long> arbitrosIds, Map<String, Object> contexto);
    ModelVersion obtenerModeloActivo(String tipoModelo);
}
