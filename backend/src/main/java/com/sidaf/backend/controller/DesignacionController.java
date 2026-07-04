package com.sidaf.backend.controller;

import com.sidaf.backend.model.Designacion;
import com.sidaf.backend.model.Designacion.EstadoDesignacion;
import com.sidaf.backend.repository.DesignacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/designaciones")
@CrossOrigin(origins = "*")
public class DesignacionController {
    
    @Autowired
    private DesignacionRepository designacionRepository;
    
    @ExceptionHandler(DuplicateAssignmentException.class)
    public ResponseEntity<String> handleDuplicate(DuplicateAssignmentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
    
    // GET all designaciones
    @GetMapping
    public List<Designacion> getAllDesignaciones() {
        return designacionRepository.findAll();
    }
    
    // GET designacion by id
    @GetMapping("/{id}")
    public ResponseEntity<Designacion> getDesignacionById(@PathVariable Long id) {
        Optional<Designacion> designacion = designacionRepository.findById(id);
        return designacion.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // GET designaciones by campeonato
    @GetMapping("/campeonato/{idCampeonato}")
    public List<Designacion> getDesignacionesByCampeonato(@PathVariable Long idCampeonato) {
        return designacionRepository.findByIdCampeonato(idCampeonato);
    }
    
    // GET designaciones by estado
    @GetMapping("/estado/{estado}")
    public List<Designacion> getDesignacionesByEstado(@PathVariable String estado) {
        try {
            EstadoDesignacion estadoEnum = EstadoDesignacion.valueOf(estado.toUpperCase());
            return designacionRepository.findByEstado(estadoEnum);
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }
    
    // GET designaciones by fecha
    @GetMapping("/fecha/{fecha}")
    public List<Designacion> getDesignacionesByFecha(@PathVariable String fecha) {
        return designacionRepository.findByFecha(fecha);
    }
    
    // GET designaciones by arbitro principal
    @GetMapping("/arbitro-principal/{arbitroId}")
    public List<Designacion> getDesignacionesByArbitroPrincipal(@PathVariable String arbitroId) {
        return designacionRepository.findByArbitroPrincipal(arbitroId);
    }
    
    // GET designaciones by arbitro asistente 1
    @GetMapping("/arbitro-asistente1/{arbitroId}")
    public List<Designacion> getDesignacionesByArbitroAsistente1(@PathVariable String arbitroId) {
        return designacionRepository.findByArbitroAsistente1(arbitroId);
    }
    
    // GET designaciones by arbitro asistente 2
    @GetMapping("/arbitro-asistente2/{arbitroId}")
    public List<Designacion> getDesignacionesByArbitroAsistente2(@PathVariable String arbitroId) {
        return designacionRepository.findByArbitroAsistente2(arbitroId);
    }
    
    // GET designaciones by cuarto arbitro
    @GetMapping("/cuarto-arbitro/{arbitroId}")
    public List<Designacion> getDesignacionesByCuartoArbitro(@PathVariable String arbitroId) {
        return designacionRepository.findByCuartoArbitro(arbitroId);
    }
    
    // GET designaciones by equipo local
    @GetMapping("/equipo-local/{idEquipo}")
    public List<Designacion> getDesignacionesByEquipoLocal(@PathVariable Long idEquipo) {
        return designacionRepository.findByIdEquipoLocal(idEquipo);
    }
    
    // GET designaciones by equipo visitante
    @GetMapping("/equipo-visitante/{idEquipo}")
    public List<Designacion> getDesignacionesByEquipoVisitante(@PathVariable Long idEquipo) {
        return designacionRepository.findByIdEquipoVisitante(idEquipo);
    }
    
    // POST create designacion
    @PostMapping
    public ResponseEntity<?> createDesignacion(@RequestBody Designacion designacion) {
        validarDuplicados(designacion);
        Designacion saved = designacionRepository.save(designacion);
        return ResponseEntity.ok(saved);
    }
    
    // POST create designaciones batch
    @PostMapping("/batch")
    public ResponseEntity<?> createDesignacionesBatch(@RequestBody List<Designacion> designaciones) {
        for (Designacion d : designaciones) {
            validarDuplicados(d);
        }
        List<Designacion> saved = designacionRepository.saveAll(designaciones);
        return ResponseEntity.ok(saved);
    }
    
    // PUT update designacion
    @PutMapping("/{id}")
    public ResponseEntity<Designacion> updateDesignacion(@PathVariable Long id, @RequestBody Designacion designacionDetails) {
        Optional<Designacion> designacion = designacionRepository.findById(id);
        if (designacion.isPresent()) {
            Designacion updatedDesignacion = designacion.get();
            updatedDesignacion.setTemporada(designacionDetails.getTemporada());
            updatedDesignacion.setEtapa(designacionDetails.getEtapa());
            updatedDesignacion.setRegion(designacionDetails.getRegion());
            updatedDesignacion.setProvincia(designacionDetails.getProvincia());
            updatedDesignacion.setDistrito(designacionDetails.getDistrito());
            updatedDesignacion.setPartidoId(designacionDetails.getPartidoId());
            updatedDesignacion.setIdCampeonato(designacionDetails.getIdCampeonato());
            updatedDesignacion.setNombreCampeonato(designacionDetails.getNombreCampeonato());
            updatedDesignacion.setIdEquipoLocal(designacionDetails.getIdEquipoLocal());
            updatedDesignacion.setNombreEquipoLocal(designacionDetails.getNombreEquipoLocal());
            updatedDesignacion.setIdEquipoVisitante(designacionDetails.getIdEquipoVisitante());
            updatedDesignacion.setNombreEquipoVisitante(designacionDetails.getNombreEquipoVisitante());
            updatedDesignacion.setFecha(designacionDetails.getFecha());
            updatedDesignacion.setHora(designacionDetails.getHora());
            updatedDesignacion.setEstadio(designacionDetails.getEstadio());
            updatedDesignacion.setArbitroPrincipal(designacionDetails.getArbitroPrincipal());
            updatedDesignacion.setArbitroAsistente1(designacionDetails.getArbitroAsistente1());
            updatedDesignacion.setArbitroAsistente2(designacionDetails.getArbitroAsistente2());
            updatedDesignacion.setCuartoArbitro(designacionDetails.getCuartoArbitro());
            updatedDesignacion.setAsesor(designacionDetails.getAsesor());
            updatedDesignacion.setPosicion(designacionDetails.getPosicion());
            updatedDesignacion.setEstado(designacionDetails.getEstado());
            updatedDesignacion.setObservaciones(designacionDetails.getObservaciones());
            return ResponseEntity.ok(designacionRepository.save(updatedDesignacion));
        }
        return ResponseEntity.notFound().build();
    }
    
    // DELETE designacion
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDesignacion(@PathVariable Long id) {
        if (designacionRepository.existsById(id)) {
            designacionRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    // Validar que un arbitro no este asignado en multiples partidos la misma fecha
    private void validarDuplicados(Designacion designacion) {
        if (designacion.getFecha() == null) {
            return;
        }
        
        String[] arbitros = {
            designacion.getArbitroPrincipal(),
            designacion.getArbitroAsistente1(),
            designacion.getArbitroAsistente2(),
            designacion.getCuartoArbitro(),
            designacion.getAsesor()
        };
        
        for (String arbitroId : arbitros) {
            if (arbitroId == null || arbitroId.isBlank()) {
                continue;
            }
            List<Designacion> existentes = designacionRepository.findByFechaAndArbitro(
                designacion.getFecha(), arbitroId
            );
            if (!existentes.isEmpty()) {
                throw new DuplicateAssignmentException(
                    "El arbitro " + arbitroId + " ya esta asignado en la fecha " + designacion.getFecha()
                );
            }
        }
    }
    
    // Excepcion personalizada para asignaciones duplicadas
    public static class DuplicateAssignmentException extends RuntimeException {
        public DuplicateAssignmentException(String message) {
            super(message);
        }
    }
