package com.sidaf.backend.controller;

import com.sidaf.backend.model.CopaPeruResultado;
import com.sidaf.backend.model.Campeonato;
import com.sidaf.backend.model.Equipo;
import com.sidaf.backend.repository.CopaPeruResultadoRepository;
import com.sidaf.backend.repository.CampeonatoRepository;
import com.sidaf.backend.repository.EquipoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/copa-peru")
@CrossOrigin(origins = "*")
public class CopaPeruResultadoController {

    @Autowired
    private CopaPeruResultadoRepository resultadoRepository;

    @Autowired
    private CampeonatoRepository campeonatoRepository;

    @Autowired
    private EquipoRepository equipoRepository;

    public static class ResultadoDTO {
        public Long campeonatoId;
        public String etapa;
        public Integer posicion;
        public Integer equipoId;
    }

    @GetMapping("/resultados")
    public ResponseEntity<List<Map<String, Object>>> getResultadosByCampeonatoAndEtapa(
            @RequestParam Long campeonatoId,
            @RequestParam String etapa
    ) {
        Optional<Campeonato> opt = campeonatoRepository.findById(campeonatoId);
        if (opt.isEmpty()) return ResponseEntity.badRequest().build();
        Campeonato campeonato = opt.get();
        List<CopaPeruResultado> resultados = resultadoRepository.findByCampeonatoAndEtapa(campeonato, etapa);

        List<Map<String, Object>> payload = resultados.stream().map(r -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", r.getId());
            m.put("posicion", r.getPosicion());
            Map<String, Object> equipoMap = new HashMap<>();
            Equipo eq = r.getEquipo();
            if (eq != null) {
                equipoMap.put("id", eq.getId());
                equipoMap.put("nombre", eq.getNombre());
                equipoMap.put("provincia", eq.getProvincia());
                equipoMap.put("distrito", eq.getDistrito());
            }
            m.put("equipo", equipoMap);
            m.put("etapa", r.getEtapa());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(payload);
    }

    @PostMapping("/resultados/batch")
    public ResponseEntity<List<CopaPeruResultado>> saveResultadosBatch(@RequestBody List<ResultadoDTO> dtos) {
        List<CopaPeruResultado> saved = new ArrayList<>();

        for (ResultadoDTO dto : dtos) {
            if (dto.campeonatoId == null || dto.equipoId == null || dto.etapa == null || dto.posicion == null) continue;
            Optional<Campeonato> optCam = campeonatoRepository.findById(dto.campeonatoId);
            Optional<Equipo> optEquipo = equipoRepository.findById(dto.equipoId);
            if (optCam.isEmpty() || optEquipo.isEmpty()) continue;

            Campeonato campeonato = optCam.get();
            Equipo equipo = optEquipo.get();

            Optional<CopaPeruResultado> existente = resultadoRepository.findByCampeonatoAndEtapaAndEquipo(campeonato, dto.etapa, equipo);

            if (existente.isPresent()) {
                CopaPeruResultado r = existente.get();
                r.setPosicion(dto.posicion);
                r.setFechaActualizacion(LocalDateTime.now());
                saved.add(resultadoRepository.save(r));
            } else {
                CopaPeruResultado r = new CopaPeruResultado();
                r.setCampeonato(campeonato);
                r.setEtapa(dto.etapa);
                r.setPosicion(dto.posicion);
                r.setEquipo(equipo);
                r.setFechaCreacion(LocalDateTime.now());
                saved.add(resultadoRepository.save(r));
            }
        }

        return ResponseEntity.ok(saved);
    }
}
