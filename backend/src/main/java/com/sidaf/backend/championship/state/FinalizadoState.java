package com.sidaf.backend.championship.state;

import com.sidaf.backend.model.Partido;
import org.springframework.stereotype.Component;

@Component
public class FinalizadoState implements EstadoPartidoState {
    @Override
    public void transicionar(Partido partido, String nuevoEstado) {
        if ("HOMOLOGADO".equalsIgnoreCase(nuevoEstado)) {
            partido.setEstado(com.sidaf.backend.model.EstadoPartido.HOMOLOGADO);
            return;
        }
        if ("EN_JUEGO".equalsIgnoreCase(nuevoEstado)) {
            partido.setEstado(com.sidaf.backend.model.EstadoPartido.EN_JUEGO);
            return;
        }
        throw new IllegalStateException("No se puede transicionar de FINALIZADO a " + nuevoEstado);
    }
    @Override
    public String getNombreEstado() { return "FINALIZADO"; }
}
