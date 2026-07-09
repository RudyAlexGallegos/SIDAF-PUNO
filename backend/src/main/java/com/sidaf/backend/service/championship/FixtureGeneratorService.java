package com.sidaf.backend.service.championship;

import com.sidaf.backend.championship.strategy.FixtureStrategy;
import com.sidaf.backend.model.Partido;
import com.sidaf.backend.repository.PartidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FixtureGeneratorService {

    private final Map<String, FixtureStrategy> strategies = new ConcurrentHashMap<>();
    private final PartidoRepository partidoRepository;

    @Autowired
    public FixtureGeneratorService(List<FixtureStrategy> strategyList, PartidoRepository partidoRepository) {
        this.partidoRepository = partidoRepository;
        for (FixtureStrategy strategy : strategyList) {
            strategies.put(strategy.getTipoFormato(), strategy);
        }
    }

    public List<Partido> generarYGuardar(Long campeonatoId, List<Long> equiposIds, Long etapaId, String tipoFormato) {
        FixtureStrategy strategy = strategies.get(tipoFormato.toUpperCase());
        if (strategy == null) {
            throw new IllegalArgumentException("Formato de fixture no soportado: " + tipoFormato);
        }
        List<Partido> partidos = strategy.generarFixture(campeonatoId, equiposIds, etapaId);
        return partidoRepository.saveAll(partidos);
    }

    public List<String> getFormatosDisponibles() {
        return List.copyOf(strategies.keySet());
    }
}
