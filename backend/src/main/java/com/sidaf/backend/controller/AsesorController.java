package com.sidaf.backend.controller;

import com.sidaf.backend.model.Asesor;
import com.sidaf.backend.service.AsesorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/asesores")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AsesorController {
    
    @Autowired
    private AsesorService asesorService;
    
    /**
     * GET /api/asesores - Obtener todos los asesores
     */
    @GetMapping
    public ResponseEntity<List<Asesor>> obtenerTodosAsesores() {
        List<Asesor> asesores = asesorService.obtenerTodosAsesores();
        return ResponseEntity.ok(asesores);
    }
    
    /**
     * GET /api/asesores/{id} - Obtener asesor por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Asesor> obtenerAsesorPorId(@PathVariable Long id) {
        Optional<Asesor> asesor = asesorService.obtenerAsesorPorId(id);
        return asesor.map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    /**
     * GET /api/asesores/usuario/{usuarioId} - Obtener asesor por usuario_id
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<Asesor> obtenerAsesorPorUsuarioId(@PathVariable Long usuarioId) {
        Optional<Asesor> asesor = asesorService.obtenerAsesorPorUsuarioId(usuarioId);
        return asesor.map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    /**
     * GET /api/asesores/activos - Obtener todos los asesores activos
     */
    @GetMapping("/estado/activos")
    public ResponseEntity<List<Asesor>> obtenerAsesoresActivos() {
        List<Asesor> asesores = asesorService.obtenerAsesoresActivos();
        return ResponseEntity.ok(asesores);
    }
    
    /**
     * GET /api/asesores/buscar?nombre=xyz - Buscar asesores por nombre
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<Asesor>> buscarAsesores(@RequestParam String nombre) {
        List<Asesor> asesores = asesorService.buscarAsesoresPorNombre(nombre);
        return ResponseEntity.ok(asesores);
    }
    
    /**
     * POST /api/asesores - Crear nuevo asesor
     */
    @PostMapping
    public ResponseEntity<?> crearAsesor(@RequestBody Asesor asesor) {
        try {
            Asesor nuevoAsesor = asesorService.crearAsesor(asesor);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoAsesor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * PUT /api/asesores/{id} - Actualizar asesor
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarAsesor(@PathVariable Long id, @RequestBody Asesor asesor) {
        try {
            Asesor asesorActualizado = asesorService.actualizarAsesor(id, asesor);
            return ResponseEntity.ok(asesorActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * PATCH /api/asesores/{id}/estado - Cambiar estado del asesor
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstadoAsesor(
        @PathVariable Long id,
        @RequestParam String estado
    ) {
        try {
            Asesor asesor = asesorService.cambiarEstadoAsesor(id, estado);
            return ResponseEntity.ok(asesor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * DELETE /api/asesores/{id} - Eliminar asesor
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarAsesor(@PathVariable Long id) {
        try {
            asesorService.eliminarAsesor(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
