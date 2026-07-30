package com.sidaf.backend.controller;

import com.sidaf.backend.model.Arbitro;
import com.sidaf.backend.repository.ArbitroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/arbitros")
@CrossOrigin(origins = "*")
public class ArbitroController {

    @Autowired
    private ArbitroRepository arbitroRepository;

    @GetMapping
    @Cacheable(value = "arbitros", unless = "#result.size() == 0")
    public List<Arbitro> listar() {
        return arbitroRepository.findAll(Sort.by(Sort.Direction.ASC, "orden"));
    }

    @GetMapping("/{id}")
    @Cacheable(value = "arbitros", key = "#id")
    public ResponseEntity<Arbitro> obtener(@PathVariable Long id) {
        Optional<Arbitro> o = arbitroRepository.findById(id);
        return o.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @CacheEvict(value = "arbitros", allEntries = true)
    public ResponseEntity<Arbitro> crear(@RequestBody Arbitro arbitro) {
        if (arbitro.getFechaRegistro() == null) {
            // fechaRegistro ya tiene valor por defecto en la entidad,
            // pero esto asegura en caso de que venga nulo.
        }
        if (arbitro.getOrden() == null) {
            Integer maxOrden = arbitroRepository.findAll(Sort.by(Sort.Direction.DESC, "orden"))
                .stream()
                .findFirst()
                .map(Arbitro::getOrden)
                .orElse(0);
            arbitro.setOrden(maxOrden + 1);
        }
        Arbitro guardado = arbitroRepository.save(arbitro);
        return ResponseEntity.created(URI.create("/api/arbitros/" + guardado.getId())).body(guardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Arbitro> actualizar(@PathVariable Long id, @RequestBody Arbitro datos) {
        Optional<Arbitro> o = arbitroRepository.findById(id);
        if (o.isEmpty()) return ResponseEntity.notFound().build();

        Arbitro e = o.get();
        // Actualizar campos permitidos (evitar sobreescribir id/fechaRegistro salvo que quieras)
        e.setNombre(datos.getNombre());
        e.setApellido(datos.getApellido());
        e.setCategoria(datos.getCategoria());
        e.setNivelPreparacion(datos.getNivelPreparacion());
        e.setExperiencia(datos.getExperiencia());
        e.setDisponible(datos.getDisponible());
        e.setEspecialidad(datos.getEspecialidad());
        e.setTelefono(datos.getTelefono());
        e.setEmail(datos.getEmail());
        e.setFechaNacimiento(datos.getFechaNacimiento());
        e.setDireccion(datos.getDireccion());
        e.setObservaciones(datos.getObservaciones());
        e.setEstado(datos.getEstado());
        if (datos.getOrden() != null) {
            e.setOrden(datos.getOrden());
        }

        Arbitro actualizado = arbitroRepository.save(e);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!arbitroRepository.existsById(id)) return ResponseEntity.notFound().build();
        arbitroRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
