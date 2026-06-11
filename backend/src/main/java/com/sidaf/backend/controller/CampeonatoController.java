package com.sidaf.backend.controller;

import com.sidaf.backend.dto.CampeonatoCreateDTO;
import com.sidaf.backend.model.Campeonato;
import com.sidaf.backend.model.Campeonato.EstadoCampeonato;
import com.sidaf.backend.repository.CampeonatoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.cache.CacheManager;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Map;

@RestController
@RequestMapping("/api/campeonato")
@CrossOrigin(origins = "*")
public class CampeonatoController {
    
    @Autowired
    private CampeonatoRepository campeonatoRepository;

    @Autowired
    private CacheManager cacheManager;

    private void evictCampeonatoCache() {
        var cache = cacheManager.getCache("campeonatos");
        if (cache != null) cache.clear();
    }
    
    // GET campeonatos by estado - RUTAS ESPECÍFICAS PRIMERO
    @GetMapping("/estado/{estado}")
    public List<Campeonato> getCampeonatosByEstado(@PathVariable String estado) {
        try {
            EstadoCampeonato estadoEnum = EstadoCampeonato.valueOf(estado.toUpperCase());
            return campeonatoRepository.findByEstado(estadoEnum);
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }
    
    // GET campeonatos by nivel de dificultad
    @GetMapping("/nivel/{nivel}")
    public List<Campeonato> getCampeonatosByNivelDificultad(@PathVariable String nivel) {
        return campeonatoRepository.findByNivelDificultad(nivel);
    }
    
    // GET campeonatos by provincia
    @GetMapping("/provincia/{provincia}")
    public List<Campeonato> getCampeonatosByProvincia(@PathVariable String provincia) {
        return campeonatoRepository.findByProvincia(provincia);
    }
    
    // GET campeonatos by ciudad
    @GetMapping("/ciudad/{ciudad}")
    public List<Campeonato> getCampeonatosByCiudad(@PathVariable String ciudad) {
        return campeonatoRepository.findByCiudad(ciudad);
    }
    
    // GET campeonatos by categoria
    @GetMapping("/categoria/{categoria}")
    public List<Campeonato> getCampeonatosByCategoria(@PathVariable String categoria) {
        return campeonatoRepository.findByCategoria(categoria);
    }
    
    // GET all campeonatos
    @GetMapping
    public List<Campeonato> getAllCampeonatos() {
        return campeonatoRepository.findAll();
    }
    
    // GET campeonato by id - RUTA GENÉRICA AL FINAL
    @GetMapping("/{id}")
    public ResponseEntity<Campeonato> getCampeonatoById(@PathVariable Long id) {
        Optional<Campeonato> campeonato = campeonatoRepository.findById(id);
        return campeonato.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    // POST create campeonato
    @CacheEvict(value = "campeonatos", allEntries = true)
    @PostMapping
    public ResponseEntity<?> createCampeonato(@RequestBody CampeonatoCreateDTO dto) {
        Campeonato campeonato = dto.toEntity();

        if (campeonato.getEquipos() == null) {
            campeonato.setEquipos(new ArrayList<>());
        }

        // Validación: requiere mínimo 2 equipos para categorías normales (no aplica para Fundamental ni Oficial)
        if (!List.of("CAMPEONATO FUNDAMENTAL", "CAMPEONATO OFICIAL").contains(campeonato.getCategoria()) &&
            campeonato.getEquipos().size() < 2) {
            return ResponseEntity.badRequest().body(Map.of("error", "Debe seleccionar al menos 2 equipos"));
        }

        // Establecer numeroEquipos según la lista
        campeonato.setNumeroEquipos(campeonato.getEquipos().size());

        // Guardar con flush para asegurar persistencia inmediata de equipos
        Campeonato saved = campeonatoRepository.saveAndFlush(campeonato);
        return ResponseEntity.ok(saved);
    }
    
    // PUT update campeonato
    @CacheEvict(value = "campeonatos", allEntries = true)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCampeonato(@PathVariable Long id, @RequestBody Campeonato campeonatoDetails) {
        Optional<Campeonato> campeonato = campeonatoRepository.findById(id);
        if (campeonato.isPresent()) {
            Campeonato updatedCampeonato = campeonato.get();
            updatedCampeonato.setNombre(campeonatoDetails.getNombre());
            updatedCampeonato.setCategoria(campeonatoDetails.getCategoria());
            updatedCampeonato.setTipo(campeonatoDetails.getTipo());
            updatedCampeonato.setFechaInicio(campeonatoDetails.getFechaInicio());
            updatedCampeonato.setFechaFin(campeonatoDetails.getFechaFin());
            updatedCampeonato.setEstado(campeonatoDetails.getEstado());
            updatedCampeonato.setOrganizador(campeonatoDetails.getOrganizador());
            updatedCampeonato.setContacto(campeonatoDetails.getContacto());
            updatedCampeonato.setCiudad(campeonatoDetails.getCiudad());
            updatedCampeonato.setProvincia(campeonatoDetails.getProvincia());
            updatedCampeonato.setDireccion(campeonatoDetails.getDireccion());
            updatedCampeonato.setEstadio(campeonatoDetails.getEstadio());
            updatedCampeonato.setHoraInicio(campeonatoDetails.getHoraInicio());
            updatedCampeonato.setHoraFin(campeonatoDetails.getHoraFin());
            updatedCampeonato.setDiasJuego(campeonatoDetails.getDiasJuego());
            updatedCampeonato.setNivelDificultad(campeonatoDetails.getNivelDificultad());
            updatedCampeonato.setFormato(campeonatoDetails.getFormato());
            updatedCampeonato.setReglas(campeonatoDetails.getReglas());
            updatedCampeonato.setPremios(campeonatoDetails.getPremios());
            updatedCampeonato.setObservaciones(campeonatoDetails.getObservaciones());
            updatedCampeonato.setLogo(campeonatoDetails.getLogo());

            // Clear and update equipos
            if (updatedCampeonato.getEquipos() == null) {
                updatedCampeonato.setEquipos(new ArrayList<>());
            }
            updatedCampeonato.getEquipos().clear();

            if (campeonatoDetails.getEquipos() != null && !campeonatoDetails.getEquipos().isEmpty()) {
                updatedCampeonato.getEquipos().addAll(campeonatoDetails.getEquipos());
            }

            // Validación: requiere mínimo 2 equipos para categorías normales (no aplica para Fundamental ni Oficial)
            if (!List.of("CAMPEONATO FUNDAMENTAL", "CAMPEONATO OFICIAL").contains(updatedCampeonato.getCategoria()) &&
                updatedCampeonato.getEquipos().size() < 2) {
                return ResponseEntity.badRequest().body(Map.of("error", "Debe seleccionar al menos 2 equipos"));
            }

            // Establecer numeroEquipos según la lista
            updatedCampeonato.setNumeroEquipos(updatedCampeonato.getEquipos().size());

            updatedCampeonato.setEtapas(campeonatoDetails.getEtapas());
            Campeonato saved = campeonatoRepository.save(updatedCampeonato);
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.notFound().build();
    }
    
    // DELETE campeonato
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCampeonato(@PathVariable Long id) {
        if (campeonatoRepository.existsById(id)) {
            campeonatoRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
