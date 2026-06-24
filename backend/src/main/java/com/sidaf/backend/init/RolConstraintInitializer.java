package com.sidaf.backend.init;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class RolConstraintInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public RolConstraintInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🔍 Verificando constraint de rol en tabla usuarios...");

        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.table_constraints " +
                " WHERE table_name = 'usuarios' AND constraint_name = 'usuarios_rol_check'",
                Integer.class
            );

            if (count == null || count == 0) {
                System.out.println("⚠️ Constraint usuarios_rol_check no encontrado, no se puede corregir automáticamente.");
                return;
            }

            jdbcTemplate.execute("ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check");
            jdbcTemplate.execute(
                "ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check " +
                "CHECK (rol IN ('ADMIN', 'PRESIDENCIA', 'PRESIDENCIA_CODAR', 'UNIDAD_TECNICA'))"
            );

            System.out.println("✅ Constraint usuarios_rol_check actualizado automáticamente.");

            // Migrar valores antiguos a los nuevos del enum
            int actualizados = jdbcTemplate.update(
                "UPDATE usuarios SET rol = 'ADMIN' WHERE rol = 'ADMINISTRADOR'"
            );
            if (actualizados > 0) {
                System.out.println("🔄 Migrados " + actualizados + " usuarios de ADMINISTRADOR -> ADMIN");
            }

actualizados = jdbcTemplate.update(
            "UPDATE usuarios SET rol = 'PRESIDENCIA' WHERE rol IN ('PRESIDENTE_SIDAF', 'PRESIDENCIA_CODAR', 'PRESIDENTE')"
        );
        if (actualizados > 0) {
            System.out.println("Migrados " + actualizados + " usuarios a PRESIDENCIA");
        }

            actualizados = jdbcTemplate.update(
                "UPDATE usuarios SET rol = 'UNIDAD_TECNICA' WHERE rol IN ('USUARIO_TECNICO', 'UNIDAD_TECNICA_LEGACY')"
            );
            if (actualizados > 0) {
                System.out.println("🔄 Migrados " + actualizados + " usuarios a UNIDAD_TECNICA");
            }

            System.out.println("✅ Migración de roles completada.");
        } catch (Exception e) {
            System.out.println("❌ Error al verificar/corregir constraint: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
