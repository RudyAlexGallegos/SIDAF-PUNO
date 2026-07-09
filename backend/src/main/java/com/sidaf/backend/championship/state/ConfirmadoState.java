package com.sidaf.backend.championship.state;

import com.sidaf.backend.model.Partido;
import org.springframework.stereotype.Component;

@Component
public class ConfirmadoState implements EstadoPartidoState {
    @Override
    public void transicionar(Partido partido, String nuevoEstado) {
        if ("EN_JUEGO".equalsIgnoreCase(nuevoEstado)) {
            partido.setEstado(com.sidaf.backend.model.EstadoPartido.EN_JUEGO);
            return;
        }
        if ("DESIGNADO".equalsIgnoreCase(nuevoEstado)) {
            partido.setEstado(com.sidaf.backend.model.EstadoPartido.DESIGNADO);
            return;
        }
        throw new IllegalStateException("No se puede transicionar de CONFIRMADO a " + nuevoEstado);
    }
    @Override
    public String getNombreEstado() { return "CONFIRMADO"; }
}
