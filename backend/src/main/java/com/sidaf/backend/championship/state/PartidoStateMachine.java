package com.sidaf.backend.championship.state;

import com.sidaf.backend.model.Partido;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class PartidoStateMachine {

    private final Map<String, EstadoPartidoState> states = new ConcurrentHashMap<>();

    @Autowired
    public PartidoStateMachine(
            BorradorState borradorState,
            ProgramadoState programadoState,
            DesignacionPendienteState designacionPendienteState,
            DesignadoState designadoState,
            ConfirmadoState confirmadoState,
            EnJuegoState enJuegoState,
            FinalizadoState finalizadoState,
            HomologadoState homologadoState) {
        states.put(borradorState.getNombreEstado(), borradorState);
        states.put(programadoState.getNombreEstado(), programadoState);
        states.put(designacionPendienteState.getNombreEstado(), designacionPendienteState);
        states.put(designadoState.getNombreEstado(), designadoState);
        states.put(confirmadoState.getNombreEstado(), confirmadoState);
        states.put(enJuegoState.getNombreEstado(), enJuegoState);
        states.put(finalizadoState.getNombreEstado(), finalizadoState);
        states.put(homologadoState.getNombreEstado(), homologadoState);
    }

    public void transicionar(Partido partido, String nuevoEstado) {
        String estadoActual = partido.getEstado() != null ? partido.getEstado().name() : null;
        if (estadoActual == null) {
            partido.setEstado(com.sidaf.backend.model.EstadoPartido.BORRADOR);
            estadoActual = "BORRADOR";
        }
        EstadoPartidoState state = states.get(estadoActual);
        if (state == null) {
            throw new IllegalStateException("Estado no reconocido: " + estadoActual);
        }
        state.transicionar(partido, nuevoEstado);
    }

    public boolean puedeTransicionar(Partido partido, String nuevoEstado) {
        try {
            String estadoActual = partido.getEstado() != null ? partido.getEstado().name() : null;
            if (estadoActual == null) return true;
            EstadoPartidoState state = states.get(estadoActual);
            if (state == null) return false;
            state.transicionar(partido, nuevoEstado);
            return true;
        } catch (IllegalStateException e) {
            return false;
        }
    }
}
