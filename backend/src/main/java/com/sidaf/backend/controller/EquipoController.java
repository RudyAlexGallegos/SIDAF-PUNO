package com.sidaf.backend.controller;

import com.sidaf.backend.model.Equipo;
import com.sidaf.backend.repository.EquipoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/equipos")
@CrossOrigin(origins = "*")
public class EquipoController {
    
    @Autowired
    private EquipoRepository equipoRepository;
    
    // GET all equipos
    @GetMapping
    public List<Equipo> getAllEquipos() {
        return equipoRepository.findAll();
    }
    
    // GET equipo by id
    @GetMapping("/{id}")
    public ResponseEntity<Equipo> getEquipoById(@PathVariable Integer id) {
        Optional<Equipo> equipo = equipoRepository.findById(id);
        return equipo.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // POST create equipo
    @PostMapping
    public Equipo createEquipo(@RequestBody Equipo equipo) {
        return equipoRepository.save(equipo);
    }
    
    // PUT update equipo
    @PutMapping("/{id}")
    public ResponseEntity<Equipo> updateEquipo(@PathVariable Integer id, @RequestBody Equipo equipoDetails) {
        Optional<Equipo> equipo = equipoRepository.findById(id);
        if (equipo.isPresent()) {
            Equipo updatedEquipo = equipo.get();
            updatedEquipo.setNombre(equipoDetails.getNombre());
            updatedEquipo.setCategoria(equipoDetails.getCategoria());
            updatedEquipo.setProvincia(equipoDetails.getProvincia());
            updatedEquipo.setEstadio(equipoDetails.getEstadio());
            updatedEquipo.setDireccion(equipoDetails.getDireccion());
            updatedEquipo.setTelefono(equipoDetails.getTelefono());
            updatedEquipo.setEmail(equipoDetails.getEmail());
            updatedEquipo.setColores(equipoDetails.getColores());
            return ResponseEntity.ok(equipoRepository.save(updatedEquipo));
        }
        return ResponseEntity.notFound().build();
    }
    
    // DELETE equipo
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipo(@PathVariable Integer id) {
        if (equipoRepository.existsById(id)) {
            equipoRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    // GET equipos by provincia
    @GetMapping("/provincia/{provincia}")
    public List<Equipo> getEquiposByProvincia(@PathVariable String provincia) {
        return equipoRepository.findByProvincia(provincia);
    }
    
    // GET equipos by categoria
    @GetMapping("/categoria/{categoria}")
    public List<Equipo> getEquiposByCategoria(@PathVariable String categoria) {
        return equipoRepository.findByCategoria(categoria);
    }
}
