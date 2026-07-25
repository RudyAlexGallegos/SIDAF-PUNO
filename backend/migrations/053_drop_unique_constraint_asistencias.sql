-- Migración 053: Eliminar constraint UNIQUE para permitir registros de asistencia posteriores
-- Sistema SIDAF-PUNO
-- Compatible con PostgreSQL

ALTER TABLE asistencia
    DROP CONSTRAINT IF EXISTS uq_asistencia_fecha_responsable_actividad;