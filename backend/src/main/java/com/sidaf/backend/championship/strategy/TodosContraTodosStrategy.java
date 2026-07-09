package com.sidaf.backend.championship.strategy;

import com.sidaf.backend.model.Partido;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class TodosContraTodosStrategy implements FixtureStrategy {
    @Override
    public List<Partido> generarFixture(Long campeonatoId, List<Long> equiposIds, Long etapaId) {
        List<Partido> partidos = new ArrayList<>();
        if (equiposIds == null || equiposIds.size() < 2) return partidos;
        int n = equiposIds.size();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                Partido p = new Partido();
                p.setCampeonatoId(campeonatoId);
                p.setEtapaId(etapaId);
                p.setEquipoLocalId(equiposIds.get(i));
                p.setEquipoVisitanteId(equiposIds.get(j));
                p.setFecha(LocalDate.now().toString());
                p.setEstado(com.sidaf.backend.model.EstadoPartido.BORRADOR);
                partidos.add(p);
            }
        }
        return partidos;
    }
    @Override
    public String getTipoFormato() { return "TODOS_CONTRA_TODOS"; }
}
