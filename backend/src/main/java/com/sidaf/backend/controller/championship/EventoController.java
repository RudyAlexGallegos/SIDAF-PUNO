package com.sidaf.backend.controller.championship;

import com.sidaf.backend.model.EventoCampeonato;
import com.sidaf.backend.service.championship.EventStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/eventos")
@CrossOrigin(origins = "*")
public class EventoController {

    @Autowired
    private EventStoreService eventStoreService;

    @GetMapping("/entidad/{entidadTipo}/{entidadId}")
    public List<EventoCampeonato> getEventosPorEntidad(@PathVariable String entidadTipo, @PathVariable Long entidadId) {
        return eventStoreService.obtenerEventosPorEntidad(entidadTipo, entidadId);
    }

    @GetMapping("/tipo/{evento}")
    public List<EventoCampeonato> getEventosPorTipo(@PathVariable String evento) {
        return eventStoreService.obtenerEventosPorTipo(com.sidaf.backend.model.TipoEvento.valueOf(evento));
    }

    @GetMapping("/rango")
    public List<EventoCampeonato> getEventosEntreFechas(@RequestParam String desde, @RequestParam String hasta) {
        LocalDateTime d = LocalDateTime.parse(desde);
        LocalDateTime h = LocalDateTime.parse(hasta);
        return eventStoreService.obtenerEventosEntreFechas(d, h);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<EventoCampeonato> getEventosPorUsuario(@PathVariable Long usuarioId) {
        return eventStoreService.obtenerEventosPorUsuario(usuarioId);
    }
}
