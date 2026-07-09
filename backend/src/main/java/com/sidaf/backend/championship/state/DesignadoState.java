package com.sidaf.backend.championship.state;

import com.sidaf.backend.model.Partido;
import org.springframework.stereotype.Component;

@Component
public class DesignadoState implements EstadoPartidoState {
    @Override
    public void transicionar(Partido partido, String nuevoEstado) {
        if ("CONFIRMADO".equalsIgnoreCase(nuevoEstado)) {
            partido.setEstado(com.sidaf.backend.model.EstadoPartido.CONFIRMADO);
            return;
        }
        if ("DESIGNACION_PENDIENTE".equalsIgnoreCase(nuevoEstado)) {
            partido.setEstado(com.sidaf.backend.model.EstadoPartido.DESIGNACION_PENDIENTE);
            return;
        }
        throw new IllegalStateException("No se puede transicionar de DESIGNADO a " + nuevoEstado);
    }
    @Override
    public String getNombreEstado() { return "DESIGNADO"; }
}
