-- Migración 052: Restaurar constraint UNIQUE para evitar duplicados de asistencia
-- Sistema SIDAF-PUNO
-- Compatible con PostgreSQL

ALTER TABLE asistencia
    ADD CONSTRAINT uq_asistencia_fecha_responsable_actividad
    UNIQUE (fecha, responsable, actividad);