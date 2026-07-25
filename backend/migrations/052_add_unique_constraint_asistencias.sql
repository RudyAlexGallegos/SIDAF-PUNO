-- Migración 052: Quitar constraint UNIQUE para permitir múltiples registros por fecha
-- Sistema SIDAF-PUNO
-- Compatible con PostgreSQL

ALTER TABLE asistencia
    DROP CONSTRAINT IF EXISTS uq_asistencia_fecha_responsable_actividad;