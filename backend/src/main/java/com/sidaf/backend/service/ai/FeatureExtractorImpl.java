package com.sidaf.backend.service.ai;

import com.sidaf.backend.model.PrediccionHistorial;
import com.sidaf.backend.repository.PrediccionHistorialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FeatureExtractorImpl implements FeatureExtractor {

    @Autowired
    private PrediccionHistorialRepository prediccionHistorialRepository;

    @Override
    public Map<String, Object> extraerCaracteristicasArbitro(Long arbitroId) {
        Map<String, Object> caracteristicas = new HashMap<>();
        caracteristicas.put("arbitroId", arbitroId);
        List<PrediccionHistorial> historial = prediccionHistorialRepository.findByArbitroId(arbitroId);
        caracteristicas.put("totalPredicciones", historial.size());
        return caracteristicas;
    }

    @Override
    public Map<String, Object> extraerCaracteristicasPartido(Long partidoId) {
        Map<String, Object> caracteristicas = new HashMap<>();
        caracteristicas.put("partidoId", partidoId);
        return caracteristicas;
    }

    @Override
    public List<Map<String, Object>> extraerCaracteristicasLote(Long campeonatoId) {
        List<PrediccionHistorial> historial = prediccionHistorialRepository.findByCampeonatoId(campeonatoId);
        return historial.stream()
                .map(p -> {
                    Map<String, Object> caracteristicas = new HashMap<>();
                    caracteristicas.put("campeonatoId", campeonatoId);
                    caracteristicas.put("arbitroId", p.getArbitroId());
                    caracteristicas.put("partidoId", p.getPartidoId());
                    caracteristicas.put("prediccion", p.getPrediccion());
                    caracteristicas.put("resultadoReal", p.getResultadoReal());
                    return caracteristicas;
                })
                .toList();
    }

    @Override
    public PrediccionHistorial compararPrediccionConReal(Long prediccionId, Map<String, Object> resultadoReal) {
        PrediccionHistorial historial = new PrediccionHistorial();
        historial.setPrediccionId(prediccionId);
        historial.setResultadoReal(resultadoReal.toString());
        historial.setFechaResultado(java.time.LocalDateTime.now());
        return prediccionHistorialRepository.save(historial);
    }
}
