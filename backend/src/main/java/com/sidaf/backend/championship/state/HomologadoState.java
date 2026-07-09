package com.sidaf.backend.championship.state;

import com.sidaf.backend.model.Partido;
import org.springframework.stereotype.Component;

@Component
public class HomologadoState implements EstadoPartidoState {
    @Override
    public void transicionar(Partido partido, String nuevoEstado) {
        throw new IllegalStateException("No se puede transicionar desde HOMOLOGADO. El partido está cerrado.");
    }
    @Override
    public String getNombreEstado() { return "HOMOLOGADO"; }
}
