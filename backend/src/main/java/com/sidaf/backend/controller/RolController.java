package com.sidaf.backend.controller;

import com.sidaf.backend.model.Rol;
import com.sidaf.backend.service.RolService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*")
@Slf4j
public class RolController {
    
    @Autowired
    private RolService rolService;
    
    /**
     * Obtener todos los roles
     */
    @GetMapping
    public ResponseEntity<?> obtenerTodosRoles() {
        try {
            List<Rol> roles = rolService.obtenerTodosRoles();
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "datos", roles,
                "cantidad", roles.size()
            ));
        } catch (Exception e) {
            log.error("Error al obtener roles", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Obtener rol por nombre
     */
    @GetMapping("/{nombre}")
    public ResponseEntity<?> obtenerRolPorNombre(@PathVariable String nombre) {
        try {
            Optional<Rol> rol = rolService.obtenerRolPorNombre(nombre);
            if (rol.isPresent()) {
                return ResponseEntity.ok(Map.of(
                    "exito", true,
                    "datos", rol.get()
                ));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error al obtener rol", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Crear nuevo rol (solo ADMINISTRADOR)
     */
    @PostMapping
    public ResponseEntity<?> crearRol(@RequestBody Map<String, Object> datos) {
        try {
            String nombre = (String) datos.get("nombre");
            String descripcion = (String) datos.get("descripcion");
            Integer jerarquia = ((Number) datos.get("jerarquia")).intValue();
            
            Rol nuevoRol = rolService.crearRol(nombre, descripcion, jerarquia);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Rol creado exitosamente",
                "datos", nuevoRol
            ));
        } catch (Exception e) {
            log.error("Error al crear rol", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
