package com.sidaf.backend.controller.championship;

import com.sidaf.backend.model.EtapaCampeonato;
import com.sidaf.backend.repository.EtapaCampeonatoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/etapas")
@CrossOrigin(origins = "*")
public class EtapaController {

    @Autowired
    private EtapaCampeonatoRepository etapaRepository;

    @GetMapping("/campeonato/{campeonatoId}")
    public List<EtapaCampeonato> getEtapasPorCampeonato(@PathVariable Long campeonatoId) {
        return etapaRepository.findByCampeonatoId(campeonatoId);
    }

    @GetMapping("/campeonato/{campeonatoId}/activa")
    public List<EtapaCampeonato> getEtapasActivas(@PathVariable Long campeonatoId) {
        return etapaRepository.findByCampeonatoIdAndActiva(campeonatoId, true);
    }

    @PostMapping
    public ResponseEntity<EtapaCampeonato> crearEtapa(@RequestBody EtapaCampeonato etapa) {
        return ResponseEntity.ok(etapaRepository.save(etapa));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EtapaCampeonato> actualizarEtapa(@PathVariable Long id, @RequestBody EtapaCampeonato detalles) {
        EtapaCampeonato etapa = etapaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Etapa no encontrada"));
        etapa.setNombre(detalles.getNombre());
        etapa.setOrden(detalles.getOrden());
        etapa.setTipoFormato(detalles.getTipoFormato());
        etapa.setActiva(detalles.getActiva());
        etapa.setFechaInicio(detalles.getFechaInicio());
        etapa.setFechaFin(detalles.getFechaFin());
        return ResponseEntity.ok(etapaRepository.save(etapa));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEtapa(@PathVariable Long id) {
        if (etapaRepository.existsById(id)) {
            etapaRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
