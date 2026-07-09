package com.sidaf.backend.championship.strategy;

import com.sidaf.backend.model.Partido;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class IdaYVueltaStrategy implements FixtureStrategy {
    @Override
    public List<Partido> generarFixture(Long campeonatoId, List<Long> equiposIds, Long etapaId) {
        List<Partido> partidos = new ArrayList<>();
        if (equiposIds == null || equiposIds.size() < 2) return partidos;
        int n = equiposIds.size();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                Partido ida = new Partido();
                ida.setCampeonatoId(campeonatoId);
                ida.setEtapaId(etapaId);
                ida.setEquipoLocalId(equiposIds.get(i));
                ida.setEquipoVisitanteId(equiposIds.get(j));
                ida.setFecha(LocalDate.now().toString());
                ida.setEstado(com.sidaf.backend.model.EstadoPartido.BORRADOR);
                partidos.add(ida);

                Partido vuelta = new Partido();
                vuelta.setCampeonatoId(campeonatoId);
                vuelta.setEtapaId(etapaId);
                vuelta.setEquipoLocalId(equiposIds.get(j));
                vuelta.setEquipoVisitanteId(equiposIds.get(i));
                vuelta.setFecha(LocalDate.now().toString());
                vuelta.setEstado(com.sidaf.backend.model.EstadoPartido.BORRADOR);
                partidos.add(vuelta);
            }
        }
        return partidos;
    }
    @Override
    public String getTipoFormato() { return "IDA_Y_VUELTA"; }
}
