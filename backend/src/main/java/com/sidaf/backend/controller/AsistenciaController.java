package com.sidaf.backend.controller;

import com.sidaf.backend.model.Asistencia;
import com.sidaf.backend.repository.AsistenciaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/asistencias")
@CrossOrigin(origins = {"http://localhost:3000", "https://sidaf-puno-neon.vercel.app", "https://sidaf-puno.vercel.app"})
public class AsistenciaController {

    @Autowired
    private AsistenciaRepository asistenciaRepository;

    @GetMapping
    public List<Asistencia> listar() {
        return asistenciaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asistencia> obtener(@PathVariable Long id) {
        Optional<Asistencia> o = asistenciaRepository.findById(id);
        return o.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Asistencia> crear(@RequestBody Asistencia asistencia) {
        if (asistencia.getCreatedAt() == null) {
            asistencia.setCreatedAt(LocalDateTime.now());
        }
        Asistencia guardado = asistenciaRepository.save(asistencia);
        return ResponseEntity.created(URI.create("/api/asistencias/" + guardado.getId())).body(guardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Asistencia> actualizar(@PathVariable Long id, @RequestBody Asistencia datos) {
        Optional<Asistencia> o = asistenciaRepository.findById(id);
        if (o.isEmpty()) return ResponseEntity.notFound().build();

        Asistencia e = o.get();
        e.setFecha(datos.getFecha());
        e.setHoraEntrada(datos.getHoraEntrada());
        e.setHoraSalida(datos.getHoraSalida());
        e.setActividad(datos.getActividad());
        e.setEvento(datos.getEvento());
        e.setEstado(datos.getEstado());
        e.setObservaciones(datos.getObservaciones());
        e.setLatitude(datos.getLatitude());
        e.setLongitude(datos.getLongitude());
        e.setResponsableId(datos.getResponsableId());
        e.setResponsable(datos.getResponsable());

        Asistencia actualizado = asistenciaRepository.save(e);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!asistenciaRepository.existsById(id)) return ResponseEntity.notFound().build();
        asistenciaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Métodos adicionales útiles
    @GetMapping("/fecha/{fecha}")
    public List<Asistencia> obtenerPorFecha(@PathVariable LocalDate fecha) {
        return asistenciaRepository.findByFecha(fecha);
    }

    @GetMapping("/actividad/{actividad}")
    public List<Asistencia> obtenerPorActividad(@PathVariable String actividad) {
        return asistenciaRepository.findByActividad(actividad);
    }

    @GetMapping("/estado/{estado}")
    public List<Asistencia> obtenerPorEstado(@PathVariable String estado) {
        return asistenciaRepository.findByEstado(estado);
    }
}
