package com.sidaf.backend.controller.championship;

import com.sidaf.backend.model.Evaluacion;
import com.sidaf.backend.repository.EvaluacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/evaluaciones")
@CrossOrigin(origins = "*")
public class EvaluacionController {

    @Autowired
    private EvaluacionRepository evaluacionRepository;

    @GetMapping
    public List<Evaluacion> getAllEvaluaciones() {
        return evaluacionRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Evaluacion> getEvaluacionById(@PathVariable Long id) {
        return evaluacionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/designacion/{designacionId}")
    public List<Evaluacion> getEvaluacionesByDesignacion(@PathVariable Long designacionId) {
        return evaluacionRepository.findByDesignacionId(designacionId);
    }

    @GetMapping("/arbitro/{arbitroId}")
    public List<Evaluacion> getEvaluacionesByArbitro(@PathVariable Long arbitroId) {
        return evaluacionRepository.findByArbitroId(arbitroId);
    }

    @GetMapping("/campeonato/{campeonatoId}")
    public List<Evaluacion> getEvaluacionesByCampeonato(@PathVariable Long campeonatoId) {
        return evaluacionRepository.findByCampeonatoId(campeonatoId);
    }

    @PostMapping
    public Evaluacion createEvaluacion(@RequestBody Evaluacion evaluacion) {
        if (evaluacion.getPuntajeTecnico() == null) evaluacion.setPuntajeTecnico(0);
        if (evaluacion.getPuntajeFisico() == null) evaluacion.setPuntajeFisico(0);
        if (evaluacion.getPuntajeTactico() == null) evaluacion.setPuntajeTactico(0);
        if (evaluacion.getPuntajeDisciplina() == null) evaluacion.setPuntajeDisciplina(0);
        if (evaluacion.getPuntajeGestion() == null) evaluacion.setPuntajeGestion(0);
        int total = evaluacion.getPuntajeTecnico() + evaluacion.getPuntajeFisico() + evaluacion.getPuntajeTactico() + evaluacion.getPuntajeDisciplina() + evaluacion.getPuntajeGestion();
        evaluacion.setPuntajeTotal(total);
        return evaluacionRepository.save(evaluacion);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Evaluacion> updateEvaluacion(@PathVariable Long id, @RequestBody Evaluacion detalles) {
        return evaluacionRepository.findById(id)
                .map(evaluacion -> {
                    evaluacion.setPuntajeTecnico(detalles.getPuntajeTecnico());
                    evaluacion.setPuntajeFisico(detalles.getPuntajeFisico());
                    evaluacion.setPuntajeTactico(detalles.getPuntajeTactico());
                    evaluacion.setPuntajeDisciplina(detalles.getPuntajeDisciplina());
                    evaluacion.setPuntajeGestion(detalles.getPuntajeGestion());
                    int total = (evaluacion.getPuntajeTecnico() != null ? evaluacion.getPuntajeTecnico() : 0) +
                                (evaluacion.getPuntajeFisico() != null ? evaluacion.getPuntajeFisico() : 0) +
                                (evaluacion.getPuntajeTactico() != null ? evaluacion.getPuntajeTactico() : 0) +
                                (evaluacion.getPuntajeDisciplina() != null ? evaluacion.getPuntajeDisciplina() : 0) +
                                (evaluacion.getPuntajeGestion() != null ? evaluacion.getPuntajeGestion() : 0);
                    evaluacion.setPuntajeTotal(total);
                    evaluacion.setComentarios(detalles.getComentarios());
                    evaluacion.setEvaluadoPor(detalles.getEvaluadoPor());
                    return ResponseEntity.ok(evaluacionRepository.save(evaluacion));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvaluacion(@PathVariable Long id) {
        if (evaluacionRepository.existsById(id)) {
            evaluacionRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
