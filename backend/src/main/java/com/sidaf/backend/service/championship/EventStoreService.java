package com.sidaf.backend.service.championship;

import com.sidaf.backend.model.EventoCampeonato;
import com.sidaf.backend.model.TipoEvento;
import com.sidaf.backend.repository.EventoCampeonatoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventStoreService {

    @Autowired
    private EventoCampeonatoRepository eventoRepository;

    public EventoCampeonato registrarEvento(String entidadTipo, Long entidadId, TipoEvento evento, String estadoAnterior, String estadoNuevo, Long usuarioId) {
        EventoCampeonato e = new EventoCampeonato();
        e.setEntidadTipo(entidadTipo);
        e.setEntidadId(entidadId);
        e.setEvento(evento);
        e.setEstadoAnterior(estadoAnterior);
        e.setEstadoNuevo(estadoNuevo);
        e.setUsuarioId(usuarioId);
        e.setFechaEvento(LocalDateTime.now());
        return eventoRepository.save(e);
    }

    public List<EventoCampeonato> obtenerEventosPorEntidad(String entidadTipo, Long entidadId) {
        return eventoRepository.findByEntidadTipoAndEntidadId(entidadTipo, entidadId);
    }

    public List<EventoCampeonato> obtenerEventosPorTipo(TipoEvento evento) {
        return eventoRepository.findByEvento(evento.name());
    }

    public List<EventoCampeonato> obtenerEventosEntreFechas(LocalDateTime desde, LocalDateTime hasta) {
        return eventoRepository.findByFechaEventoBetween(desde, hasta);
    }

    public List<EventoCampeonato> obtenerEventosPorUsuario(Long usuarioId) {
        return eventoRepository.findByUsuarioId(usuarioId);
    }
}
