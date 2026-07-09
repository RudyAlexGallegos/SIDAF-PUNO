package com.sidaf.backend.championship.strategy;

import com.sidaf.backend.model.Partido;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class EliminacionSimpleStrategy implements FixtureStrategy {
    @Override
    public List<Partido> generarFixture(Long campeonatoId, List<Long> equiposIds, Long etapaId) {
        List<Partido> partidos = new ArrayList<>();
        if (equiposIds == null || equiposIds.size() < 2) return partidos;
        int n = equiposIds.size();
        boolean esPotenciaDeDos = (n & (n - 1)) == 0;
        if (!esPotenciaDeDos) {
            throw new IllegalArgumentException("Eliminación simple requiere cantidad de equipos potencia de 2");
        }
        for (int i = 0; i < n / 2; i++) {
            Partido p = new Partido();
            p.setCampeonatoId(campeonatoId);
            p.setEtapaId(etapaId);
            p.setEquipoLocalId(equiposIds.get(i));
            p.setEquipoVisitanteId(equiposIds.get(n - 1 - i));
            p.setFecha(LocalDate.now().toString());
            p.setEstado(com.sidaf.backend.model.EstadoPartido.BORRADOR);
            partidos.add(p);
        }
        return partidos;
    }
    @Override
    public String getTipoFormato() { return "ELIMINACION_SIMPLE"; }
}
