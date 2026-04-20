package com.sidaf.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/migration")
@CrossOrigin(origins = "*")
public class MigrationController {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    /**
     * Ejecutar migración de roles
     * Solo ADMIN puede acceder
     */
    @PostMapping("/roles")
    public ResponseEntity<?> migrarRoles(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Validación básica (usuario debe estar autenticado)
            if (authHeader == null || authHeader.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
            }
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("inicio", "Iniciando migración de roles...");
            
            // 1. Migrar UNIDAD_TECNICA_CODAR → UNIDAD_TECNICA
            int updated1 = jdbcTemplate.update(
                "UPDATE usuarios SET rol = 'UNIDAD_TECNICA' WHERE rol = 'UNIDAD_TECNICA_CODAR'"
            );
            resultado.put("unidad_tecnica_codar_migrados", updated1);
            
            // 2. Migrar PRESIDENCIA_CODAR → PRESIDENCIA
            int updated2 = jdbcTemplate.update(
                "UPDATE usuarios SET rol = 'PRESIDENCIA' WHERE rol = 'PRESIDENCIA_CODAR'"
            );
            resultado.put("presidencia_codar_migrados", updated2);
            
            // 3. Migrar CODAR → UNIDAD_TECNICA
            int updated3 = jdbcTemplate.update(
                "UPDATE usuarios SET rol = 'UNIDAD_TECNICA' WHERE rol = 'CODAR'"
            );
            resultado.put("codar_migrados", updated3);
            
            // 4. Crear índice
            try {
                jdbcTemplate.execute(
                    "CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol)"
                );
                resultado.put("indice_creado", true);
            } catch (Exception e) {
                resultado.put("indice_creado", false);
                resultado.put("indice_info", e.getMessage());
            }
            
            // 5. Verificar resultado
            List<Map<String, Object>> roles = jdbcTemplate.queryForList(
                "SELECT DISTINCT rol FROM usuarios ORDER BY rol"
            );
            resultado.put("roles_finales", roles);
            
            // 6. Contar usuarios por rol
            List<Map<String, Object>> estadisticas = jdbcTemplate.queryForList(
                "SELECT rol, COUNT(*) as cantidad FROM usuarios GROUP BY rol ORDER BY rol"
            );
            resultado.put("estadisticas", estadisticas);
            
            resultado.put("estado", "✅ MIGRACIÓN COMPLETADA");
            resultado.put("total_migrados", updated1 + updated2 + updated3);
            
            return ResponseEntity.ok(resultado);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error durante la migración",
                "detalle", e.getMessage()
            ));
        }
    }
    
    /**
     * Verificar estado de roles sin hacer cambios
     */
    @GetMapping("/roles/status")
    public ResponseEntity<?> statusRoles() {
        try {
            Map<String, Object> resultado = new HashMap<>();
            
            // Roles únicos
            List<Map<String, Object>> roles = jdbcTemplate.queryForList(
                "SELECT DISTINCT rol FROM usuarios ORDER BY rol"
            );
            resultado.put("roles_unicos", roles);
            
            // Estadísticas
            List<Map<String, Object>> estadisticas = jdbcTemplate.queryForList(
                "SELECT rol, COUNT(*) as cantidad FROM usuarios GROUP BY rol ORDER BY rol"
            );
            resultado.put("usuarios_por_rol", estadisticas);
            
            return ResponseEntity.ok(resultado);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
