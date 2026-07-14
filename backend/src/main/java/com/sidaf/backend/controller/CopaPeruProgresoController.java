package com.sidaf.backend.controller;

import com.sidaf.backend.model.Campeonato;
import com.sidaf.backend.model.CopaPeruProgreso;
import com.sidaf.backend.repository.CampeonatoRepository;
import com.sidaf.backend.repository.CopaPeruProgresoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/copa-peru/progreso")
@CrossOrigin(origins = "*")
public class CopaPeruProgresoController {

    @Autowired
    private CopaPeruProgresoRepository progresoRepository;

    @Autowired
    private CampeonatoRepository campeonatoRepository;

    public static class ProgresoDTO {
        public Long id;
        public String etapa;
        public String provincia;
        public String distrito;
        public boolean completada;
        public boolean desbloqueada;
        public Long campeonId;
        public Long subcampeonId;
    }

    public static class ProgresoGuardarDTO {
        public Long campeonatoId;
        public String etapa;
        public String provincia;
        public String distrito;
        public boolean completada;
        public boolean desbloqueada;
        public Long campeonId;
        public Long subcampeonId;
    }

    @GetMapping
    public ResponseEntity<List<ProgresoDTO>> getProgreso(
            @RequestParam(required = false) Long campeonatoId,
            @RequestParam(required = false) String etapa,
            @RequestParam(required = false) String provincia,
            @RequestParam(required = false) String distrito
    ) {
        List<CopaPeruProgreso> resultados;

        if (campeonatoId != null && etapa != null && provincia != null && distrito != null) {
            Optional<Campeonato> opt = campeonatoRepository.findById(campeonatoId);
            if (opt.isEmpty()) return ResponseEntity.badRequest().build();
            Optional<CopaPeruProgreso> p = progresoRepository.findByCampeonatoAndEtapaAndProvinciaAndDistrito(
                    opt.get(), etapa, provincia, distrito);
            resultados = p.map(List::of).orElseGet(List::of);
        } else if (campeonatoId != null && etapa != null) {
            Optional<Campeonato> opt = campeonatoRepository.findById(campeonatoId);
            if (opt.isEmpty()) return ResponseEntity.badRequest().build();
            resultados = progresoRepository.findByCampeonatoAndEtapa(opt.get(), etapa);
        } else if (campeonatoId != null) {
            Optional<Campeonato> opt = campeonatoRepository.findById(campeonatoId);
            if (opt.isEmpty()) return ResponseEntity.badRequest().build();
            resultados = progresoRepository.findByCampeonato(opt.get());
        } else {
            resultados = progresoRepository.findAll();
        }

        List<ProgresoDTO> payload = resultados.stream().map(r -> {
            ProgresoDTO dto = new ProgresoDTO();
            dto.id = r.getId();
            dto.etapa = r.getEtapa();
            dto.provincia = r.getProvincia();
            dto.distrito = r.getDistrito();
            dto.completada = r.isCompletada();
            dto.desbloqueada = r.isDesbloqueada();
            dto.campeonId = r.getCampeonId();
            dto.subcampeonId = r.getSubcampeonId();
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(payload);
    }

    @PostMapping("/batch")
    public ResponseEntity<List<CopaPeruProgreso>> guardarProgresoBatch(@RequestBody List<ProgresoGuardarDTO> dtos) {
        List<CopaPeruProgreso> saved = new ArrayList<>();

        for (ProgresoGuardarDTO dto : dtos) {
            if (dto.campeonatoId == null || dto.etapa == null) continue;

            Optional<Campeonato> optCam = campeonatoRepository.findById(dto.campeonatoId);
            if (optCam.isEmpty()) continue;

            Campeonato campeonato = optCam.get();
            CopaPeruProgreso progreso;

            if (dto.provincia != null && dto.distrito != null) {
                Optional<CopaPeruProgreso> existente = progresoRepository.findByCampeonatoAndEtapaAndProvinciaAndDistrito(
                        campeonato, dto.etapa, dto.provincia, dto.distrito);
                progreso = existente.orElseGet(CopaPeruProgreso::new);
            } else if (dto.provincia != null) {
                Optional<CopaPeruProgreso> existente = progresoRepository.findByCampeonatoAndEtapaAndProvinciaAndDistrito(
                        campeonato, dto.etapa, dto.provincia, null);
                progreso = existente.orElseGet(CopaPeruProgreso::new);
            } else {
                Optional<CopaPeruProgreso> existente = progresoRepository.findByCampeonatoAndEtapaAndProvinciaAndDistrito(
                        campeonato, dto.etapa, null, null);
                progreso = existente.orElseGet(CopaPeruProgreso::new);
            }

            progreso.setCampeonato(campeonato);
            progreso.setEtapa(dto.etapa);
            progreso.setProvincia(dto.provincia);
            progreso.setDistrito(dto.distrito);
            progreso.setCompletada(dto.completada);
            progreso.setDesbloqueada(dto.desbloqueada);
            progreso.setCampeonId(dto.campeonId);
            progreso.setSubcampeonId(dto.subcampeonId);

            saved.add(progresoRepository.save(progreso));
        }

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping
    public ResponseEntity<Void> eliminarProgreso(
            @RequestParam Long campeonatoId,
            @RequestParam(required = false) String etapa,
            @RequestParam(required = false) String provincia
    ) {
        Optional<Campeonato> opt = campeonatoRepository.findById(campeonatoId);
        if (opt.isEmpty()) return ResponseEntity.badRequest().build();

        if (etapa != null && provincia != null) {
            progresoRepository.findByCampeonatoAndEtapaAndProvinciaAndDistrito(opt.get(), etapa, provincia, null)
                    .ifPresent(progresoRepository::delete);
        } else if (etapa != null) {
            progresoRepository.deleteByCampeonatoAndEtapa(opt.get(), etapa);
        } else {
            progresoRepository.findByCampeonato(opt.get()).forEach(progresoRepository::delete);
        }

        return ResponseEntity.ok().build();
    }
}
