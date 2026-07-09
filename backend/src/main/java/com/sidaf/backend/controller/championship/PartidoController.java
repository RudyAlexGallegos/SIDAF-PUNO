package com.sidaf.backend.controller.championship;

import com.sidaf.backend.model.Partido;
import com.sidaf.backend.repository.PartidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/partidos")
@CrossOrigin(origins = "*")
public class PartidoController {

    @Autowired
    private PartidoRepository partidoRepository;

    @GetMapping
    public List<Partido> getAllPartidos() {
        return partidoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Partido> getPartidoById(@PathVariable Long id) {
        return partidoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/campeonato/{campeonatoId}")
    public List<Partido> getPartidosByCampeonato(@PathVariable Long campeonatoId) {
        return partidoRepository.findByCampeonatoId(campeonatoId);
    }

    @GetMapping("/campeonato/{campeonatoId}/estado/{estado}")
    public List<Partido> getPartidosByCampeonatoAndEstado(@PathVariable Long campeonatoId, @PathVariable String estado) {
        try {
            com.sidaf.backend.model.EstadoPartido estadoEnum = com.sidaf.backend.model.EstadoPartido.valueOf(estado.toUpperCase());
            return partidoRepository.findByCampeonatoIdAndEstado(campeonatoId, estadoEnum);
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    @PostMapping
    public Partido createPartido(@RequestBody Partido partido) {
        if (partido.getEstado() == null) {
            partido.setEstado(com.sidaf.backend.model.EstadoPartido.BORRADOR);
        }
        return partidoRepository.save(partido);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Partido> updatePartido(@PathVariable Long id, @RequestBody Partido detalles) {
        return partidoRepository.findById(id)
                .map(partido -> {
                    partido.setFecha(detalles.getFecha());
                    partido.setHora(detalles.getHora());
                    partido.setEstadio(detalles.getEstadio());
                    partido.setEquipoLocalId(detalles.getEquipoLocalId());
                    partido.setEquipoVisitanteId(detalles.getEquipoVisitanteId());
                    partido.setGolesLocal(detalles.getGolesLocal());
                    partido.setGolesVisitante(detalles.getGolesVisitante());
                    partido.setObservaciones(detalles.getObservaciones());
                    return ResponseEntity.ok(partidoRepository.save(partido));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePartido(@PathVariable Long id) {
        if (partidoRepository.existsById(id)) {
            partidoRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
