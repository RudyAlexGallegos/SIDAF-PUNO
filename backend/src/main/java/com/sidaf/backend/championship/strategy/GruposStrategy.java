package com.sidaf.backend.championship.strategy;

import com.sidaf.backend.model.Partido;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class GruposStrategy implements FixtureStrategy {
    @Override
    public List<Partido> generarFixture(Long campeonatoId, List<Long> equiposIds, Long etapaId) {
        List<Partido> partidos = new ArrayList<>();
        if (equiposIds == null || equiposIds.size() < 4) return partidos;
        int mitad = equiposIds.size() / 2;
        List<Long> grupoA = equiposIds.subList(0, mitad);
        List<Long> grupoB = equiposIds.subList(mitad, equiposIds.size());
        partidos.addAll(generarPartidosGrupo(campeonatoId, etapaId, grupoA));
        partidos.addAll(generarPartidosGrupo(campeonatoId, etapaId, grupoB));
        return partidos;
    }
    private List<Partido> generarPartidosGrupo(Long campeonatoId, Long etapaId, List<Long> grupo) {
        List<Partido> partidos = new ArrayList<>();
        int n = grupo.size();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                Partido p = new Partido();
                p.setCampeonatoId(campeonatoId);
                p.setEtapaId(etapaId);
                p.setEquipoLocalId(grupo.get(i));
                p.setEquipoVisitanteId(grupo.get(j));
                p.setFecha(LocalDate.now().toString());
                p.setEstado(com.sidaf.backend.model.EstadoPartido.BORRADOR);
                partidos.add(p);
            }
        }
        return partidos;
    }
    @Override
    public String getTipoFormato() { return "GRUPOS"; }
}
