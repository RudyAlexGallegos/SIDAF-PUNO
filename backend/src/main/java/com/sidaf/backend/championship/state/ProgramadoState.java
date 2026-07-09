package com.sidaf.backend.championship.state;

import com.sidaf.backend.model.Partido;
import org.springframework.stereotype.Component;

@Component
public class ProgramadoState implements EstadoPartidoState {
    @Override
    public void transicionar(Partido partido, String nuevoEstado) {
        if ("DESIGNACION_PENDIENTE".equalsIgnoreCase(nuevoEstado)) {
            partido.setEstado(com.sidaf.backend.model.EstadoPartido.DESIGNACION_PENDIENTE);
            return;
        }
        if ("BORRADOR".equalsIgnoreCase(nuevoEstado)) {
            partido.setEstado(com.sidaf.backend.model.EstadoPartido.BORRADOR);
            return;
        }
        throw new IllegalStateException("No se puede transicionar de PROGRAMADO a " + nuevoEstado);
    }
    @Override
    public String getNombreEstado() { return "PROGRAMADO"; }
}
