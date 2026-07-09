package com.sidaf.backend.service.ai;

import com.sidaf.backend.model.Prediccion;
import com.sidaf.backend.model.ModelVersion;
import com.sidaf.backend.repository.PrediccionRepository;
import com.sidaf.backend.repository.ModelVersionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PredictionServiceImpl implements PredictionService {

    @Autowired
    private PrediccionRepository prediccionRepository;

    @Autowired
    private ModelVersionRepository modelVersionRepository;

    @Override
    public Prediccion predecir(Long campeonatoId, Long arbitroId, Map<String, Object> contexto) {
        ModelVersion modelo = modelVersionRepository.findByTipoModeloAndActivoTrue("LSTM");
        if (modelo == null) {
            throw new IllegalStateException("No hay modelo LSTM activo");
        }
        Prediccion prediccion = new Prediccion();
        prediccion.setModelVersionId(modelo.getId());
        prediccion.setCampeonatoId(campeonatoId);
        prediccion.setArbitroId(arbitroId);
        prediccion.setPrediccion(new HashMap<>(contexto).toString());
        prediccion.setConfianza(0.0);
        prediccion.setFechaPrediccion(java.time.LocalDateTime.now());
        return prediccionRepository.save(prediccion);
    }

    @Override
    public List<Prediccion> predecirLote(Long campeonatoId, List<Long> arbitrosIds, Map<String, Object> contexto) {
        return arbitrosIds.stream()
                .map(id -> predecir(campeonatoId, id, contexto))
                .toList();
    }

    @Override
    public ModelVersion obtenerModeloActivo(String tipoModelo) {
        return modelVersionRepository.findByTipoModeloAndActivoTrue(tipoModelo);
    }
}
