package com.sidaf.backend.service.ai;

import com.sidaf.backend.model.Prediccion;
import com.sidaf.backend.model.PrediccionHistorial;
import java.util.List;
import java.util.Map;

public interface FeatureExtractor {
    Map<String, Object> extraerCaracteristicasArbitro(Long arbitroId);
    Map<String, Object> extraerCaracteristicasPartido(Long partidoId);
    List<Map<String, Object>> extraerCaracteristicasLote(Long campeonatoId);
    PrediccionHistorial compararPrediccionConReal(Long prediccionId, Map<String, Object> resultadoReal);
}
