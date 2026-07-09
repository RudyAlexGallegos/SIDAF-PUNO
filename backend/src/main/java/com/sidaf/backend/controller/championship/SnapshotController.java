package com.sidaf.backend.controller.championship;

import com.sidaf.backend.model.ArbitroSnapshot;
import com.sidaf.backend.model.CampeonatoSnapshot;
import com.sidaf.backend.model.EquipoSnapshot;
import com.sidaf.backend.service.championship.SnapshotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/snapshots")
@CrossOrigin(origins = "*")
public class SnapshotController {

    @Autowired
    private SnapshotService snapshotService;

    @PostMapping("/arbitro/{arbitroId}")
    public ResponseEntity<ArbitroSnapshot> crearSnapshotArbitro(@PathVariable Long arbitroId) {
        return ResponseEntity.ok(snapshotService.crearSnapshotArbitro(arbitroId));
    }

    @GetMapping("/arbitro/{arbitroId}")
    public List<ArbitroSnapshot> getSnapshotsArbitro(@PathVariable Long arbitroId) {
        return snapshotService.obtenerSnapshotsArbitro(arbitroId);
    }

    @PostMapping("/equipo/{equipoId}")
    public ResponseEntity<EquipoSnapshot> crearSnapshotEquipo(@PathVariable Integer equipoId) {
        return ResponseEntity.ok(snapshotService.crearSnapshotEquipo(equipoId));
    }

    @GetMapping("/equipo/{equipoId}")
    public List<EquipoSnapshot> getSnapshotsEquipo(@PathVariable Integer equipoId) {
        return snapshotService.obtenerSnapshotsEquipo(equipoId);
    }

    @PostMapping("/campeonato/{campeonatoId}")
    public ResponseEntity<CampeonatoSnapshot> crearSnapshotCampeonato(@PathVariable Long campeonatoId) {
        return ResponseEntity.ok(snapshotService.crearSnapshotCampeonato(campeonatoId));
    }

    @GetMapping("/campeonato/{campeonatoId}")
    public List<CampeonatoSnapshot> getSnapshotsCampeonato(@PathVariable Long campeonatoId) {
        return snapshotService.obtenerSnapshotsCampeonato(campeonatoId);
    }
}
