package com.sidaf.backend.service.championship;

import com.sidaf.backend.championship.state.PartidoStateMachine;
import com.sidaf.backend.model.EventoCampeonato;
import com.sidaf.backend.model.Partido;
import com.sidaf.backend.repository.EventoCampeonatoRepository;
import com.sidaf.backend.repository.PartidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CampeonatoMotorService {

    @Autowired
    private PartidoRepository partidoRepository;

    @Autowired
    private PartidoStateMachine partidoStateMachine;

    @Autowired
    private EventoCampeonatoRepository eventoCampeonatoRepository;

    @Transactional
    public Partido cambiarEstadoPartido(Long partidoId, String nuevoEstado, Long usuarioId) {
        Partido partido = partidoRepository.findById(partidoId)
                .orElseThrow(() -> new IllegalArgumentException("Partido no encontrado"));
        String estadoAnterior = partido.getEstado() != null ? partido.getEstado().name() : null;
        partidoStateMachine.transicionar(partido, nuevoEstado);
        Partido guardado = partidoRepository.save(partido);
        registrarEvento("Partido", partidoId, com.sidaf.backend.model.TipoEvento.PARTIDO_INICIADO, estadoAnterior, guardado.getEstado().name(), usuarioId);
        return guardado;
    }

    @Transactional
    public EventoCampeonato registrarEvento(String entidadTipo, Long entidadId, com.sidaf.backend.model.TipoEvento evento, String estadoAnterior, String estadoNuevo, Long usuarioId) {
        EventoCampeonato e = new EventoCampeonato();
        e.setEntidadTipo(entidadTipo);
        e.setEntidadId(entidadId);
        e.setEvento(evento);
        e.setEstadoAnterior(estadoAnterior);
        e.setEstadoNuevo(estadoNuevo);
        e.setUsuarioId(usuarioId);
        e.setFechaEvento(java.time.LocalDateTime.now());
        return eventoCampeonatoRepository.save(e);
    }

    public boolean puedeTransicionar(Long partidoId, String nuevoEstado) {
        Partido partido = partidoRepository.findById(partidoId).orElse(null);
        if (partido == null) return false;
        return partidoStateMachine.puedeTransicionar(partido, nuevoEstado);
    }
}
