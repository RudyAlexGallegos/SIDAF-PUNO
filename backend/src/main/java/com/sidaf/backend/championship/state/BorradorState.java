package com.sidaf.backend.championship.state;

import com.sidaf.backend.model.Partido;
import org.springframework.stereotype.Component;

@Component
public class BorradorState implements EstadoPartidoState {
    @Override
    public void transicionar(Partido partido, String nuevoEstado) {
        if ("PROGRAMADO".equalsIgnoreCase(nuevoEstado)) {
            partido.setEstado(com.sidaf.backend.model.EstadoPartido.PROGRAMADO);
            return;
        }
        throw new IllegalStateException("No se puede transicionar de BORRADOR a " + nuevoEstado);
    }
    @Override
    public String getNombreEstado() { return "BORRADOR"; }
}
