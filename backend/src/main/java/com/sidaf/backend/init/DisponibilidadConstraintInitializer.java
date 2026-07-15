package com.sidaf.backend.init;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Garantiza, en el arranque, el índice único PARCIAL que impone la regla de
 * consistencia de disponibilidad: un árbitro solo puede tener UN bloqueo
 * activo (estado = 'BLOQUEADO') por fecha, global a todos los campeonatos.
 *
 * Es necesario porque el proyecto usa Hibernate ddl-auto=update (sin Flyway),
 * y Hibernate crea la tabla desde la entidad pero NO crea índices únicos
 * parciales (con cláusula WHERE).
 */
@Component
@Order(20)
public class DisponibilidadConstraintInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DisponibilidadConstraintInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        System.out.println("🔒 Verificando índice único de disponibilidad de árbitros...");

        // 1. Deduplicar bloqueos activos preexistentes que impedirían crear el índice único.
        //    Conserva el más reciente por (arbitro_id, fecha) y libera el resto.
        try {
            int liberados = jdbcTemplate.update(
                "UPDATE arbitro_disponibilidad d SET estado = 'LIBERADO' " +
                "WHERE d.estado = 'BLOQUEADO' AND d.id NOT IN ( " +
                "  SELECT MAX(id) FROM arbitro_disponibilidad " +
                "  WHERE estado = 'BLOQUEADO' GROUP BY arbitro_id, fecha )"
            );
            if (liberados > 0) {
                System.out.println("🔄 Se liberaron " + liberados +
                        " bloqueos duplicados antes de crear el índice único.");
            }
        } catch (Exception e) {
            // Si la tabla aún no existe, Hibernate la crea después; el índice se creará vacío.
            System.out.println("ℹ️ No se pudo deduplicar (posible tabla vacía/inexistente): " + e.getMessage());
        }

        // 2. Crear el índice único parcial. Si falla, FALLAR RUIDOSAMENTE: sin este índice
        //    no existe garantía anti doble-reserva y el sistema quedaría inconsistente.
        try {
            jdbcTemplate.execute(
                "CREATE UNIQUE INDEX IF NOT EXISTS ux_arbitro_disp_bloqueo_dia " +
                "ON arbitro_disponibilidad(arbitro_id, fecha) " +
                "WHERE estado = 'BLOQUEADO'"
            );
            jdbcTemplate.execute(
                "CREATE INDEX IF NOT EXISTS idx_arbitro_disp_arbitro_fecha " +
                "ON arbitro_disponibilidad(arbitro_id, fecha)");
            jdbcTemplate.execute(
                "CREATE INDEX IF NOT EXISTS idx_arbitro_disp_designacion " +
                "ON arbitro_disponibilidad(designacion_id)");
            System.out.println("✅ Índice ux_arbitro_disp_bloqueo_dia garantizado.");
        } catch (Exception e) {
            System.err.println("❌ CRÍTICO: no se pudo crear el índice único de disponibilidad. " +
                    "Abortando arranque para evitar doble-reserva. Detalle: " + e.getMessage());
            throw new IllegalStateException(
                    "No se pudo garantizar ux_arbitro_disp_bloqueo_dia (consistencia de disponibilidad)", e);
        }
    }
}
