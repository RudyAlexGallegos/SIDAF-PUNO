package com.sidaf.backend.championship.state;

import com.sidaf.backend.model.Partido;
import org.springframework.stereotype.Component;

@Component
public class EnJuegoState implements EstadoPartidoState {
    @Override
    public void transicionar(Partido partido, String nuevoEstado) {
        if ("FINALIZADO".equalsIgnoreCase(nuevoEstado)) {
            partido.setEstado(com.sidaf.backend.model.EstadoPartido.FINALIZADO);
            return;
        }
        if ("CONFIRMADO".equalsIgnoreCase(nuevoEstado)) {
            partido.setEstado(com.sidaf.backend.model.EstadoPartido.CONFIRMADO);
            return;
        }
        throw new IllegalStateException("No se puede transicionar de EN_JUEGO a " + nuevoEstado);
    }
    @Override
    public String getNombreEstado() { return "EN_JUEGO"; }
}
