package com.sidaf.backend.championship.strategy;

import com.sidaf.backend.model.Partido;
import java.util.List;

public interface FixtureStrategy {
    List<Partido> generarFixture(Long campeonatoId, List<Long> equiposIds, Long etapaId);
    String getTipoFormato();
}
