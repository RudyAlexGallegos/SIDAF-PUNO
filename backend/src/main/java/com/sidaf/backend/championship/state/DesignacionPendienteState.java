package com.sidaf.backend.championship.state;

import com.sidaf.backend.model.Partido;
import org.springframework.stereotype.Component;

@Component
public class DesignacionPendienteState implements EstadoPartidoState {
    @Override
    public void transicionar(Partido partido, String nuevoEstado) {
        if ("DESIGNADO".equalsIgnoreCase(nuevoEstado)) {
            partido.setEstado(com.sidaf.backend.model.EstadoPartido.DESIGNADO);
            return;
        }
        if ("PROGRAMADO".equalsIgnoreCase(nuevoEstado)) {
            partido.setEstado(com.sidaf.backend.model.EstadoPartido.PROGRAMADO);
            return;
        }
        throw new IllegalStateException("No se puede transicionar de DESIGNACION_PENDIENTE a " + nuevoEstado);
    }
    @Override
    public String getNombreEstado() { return "DESIGNACION_PENDIENTE"; }
}
