package com.sidaf.backend.championship.state;

import com.sidaf.backend.model.Partido;

public interface EstadoPartidoState {
    void transicionar(Partido partido, String nuevoEstado);
    String getNombreEstado();
}
