package com.sidaf.backend.controller.championship;

import com.sidaf.backend.model.Partido;
import com.sidaf.backend.service.championship.CampeonatoMotorService;
import com.sidaf.backend.service.championship.FixtureGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/campeonato-motor")
@CrossOrigin(origins = "*")
public class CampeonatoMotorController {

    @Autowired
    private CampeonatoMotorService campeonatoMotorService;

    @Autowired
    private FixtureGeneratorService fixtureGeneratorService;

    @PostMapping("/partidos/{id}/estado")
    public ResponseEntity<Partido> cambiarEstadoPartido(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        Long usuarioId = body.containsKey("usuarioId") ? Long.valueOf(body.get("usuarioId")) : null;
        return ResponseEntity.ok(campeonatoMotorService.cambiarEstadoPartido(id, nuevoEstado, usuarioId));
    }

    @GetMapping("/partidos/{id}/puede-transicionar")
    public ResponseEntity<Boolean> puedeTransicionar(@PathVariable Long id, @RequestParam String estado) {
        return ResponseEntity.ok(campeonatoMotorService.puedeTransicionar(id, estado));
    }

    @PostMapping("/fixture/generar")
    public ResponseEntity<List<Partido>> generarFixture(@RequestBody Map<String, Object> body) {
        Long campeonatoId = Long.valueOf(body.get("campeonatoId").toString());
        List<Integer> equiposIds = (List<Integer>) body.get("equiposIds");
        Long etapaId = body.containsKey("etapaId") ? Long.valueOf(body.get("etapaId").toString()) : null;
        String tipoFormato = (String) body.get("tipoFormato");
        List<Long> equiposLong = equiposIds.stream().map(Integer::longValue).toList();
        List<Partido> partidos = fixtureGeneratorService.generarYGuardar(campeonatoId, equiposLong, etapaId, tipoFormato);
        return ResponseEntity.ok(partidos);
    }

    @GetMapping("/fixture/formatos")
    public ResponseEntity<List<String>> getFormatosDisponibles() {
        return ResponseEntity.ok(fixtureGeneratorService.getFormatosDisponibles());
    }
}
