package com.sidaf.backend.controller;

import com.sidaf.backend.model.Campeonato;
import com.sidaf.backend.model.Campeonato.EstadoCampeonato;
import com.sidaf.backend.repository.CampeonatoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/campeonato")
@CrossOrigin(origins = "*")
public class CampeonatoController {
    
    @Autowired
    private CampeonatoRepository campeonatoRepository;
    
    // GET all campeonatos
    @GetMapping
    public List<Campeonato> getAllCampeonatos() {
        return campeonatoRepository.findAll();
    }
    
    // GET campeonato by id
    @GetMapping("/{id}")
    public ResponseEntity<Campeonato> getCampeonatoById(@PathVariable Long id) {
        Optional<Campeonato> campeonato = campeonatoRepository.findById(id);
        return campeonato.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // GET campeonatos by estado
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
    
    // POST create campeonato
    @PostMapping
    public Campeonato createCampeonato(@RequestBody Campeonato campeonato) {
        return campeonatoRepository.save(campeonato);
    }
    
    // PUT update campeonato
    @PutMapping("/{id}")
    public ResponseEntity<Campeonato> updateCampeonato(@PathVariable Long id, @RequestBody Campeonato campeonatoDetails) {
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
            updatedCampeonato.setNumeroEquipos(campeonatoDetails.getNumeroEquipos());
            updatedCampeonato.setFormato(campeonatoDetails.getFormato());
            updatedCampeonato.setReglas(campeonatoDetails.getReglas());
            updatedCampeonato.setPremios(campeonatoDetails.getPremios());
            updatedCampeonato.setObservaciones(campeonatoDetails.getObservaciones());
            updatedCampeonato.setLogo(campeonatoDetails.getLogo());
            updatedCampeonato.setEquipos(campeonatoDetails.getEquipos());
            return ResponseEntity.ok(campeonatoRepository.save(updatedCampeonato));
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
