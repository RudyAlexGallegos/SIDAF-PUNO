-- MigraciÃ³n 012: Agregar campos de mejora para asistencia (dÃ­as obligatorios, retrasos)
-- Sistema SIDAF-PUNO
-- Compatible con PostgreSQL

-- Agregar columna tipo_dia
ALTER TABLE asistencia ADD COLUMN IF NOT EXISTS tipo_dia VARCHAR(20);

-- Agregar columna tiene_retraso
ALTER TABLE asistencia ADD COLUMN IF NOT EXISTS tiene_retraso BOOLEAN DEFAULT FALSE;

-- Agregar columna minutos_retraso
ALTER TABLE asistencia ADD COLUMN IF NOT EXISTS minutos_retraso INTEGER DEFAULT 0;

-- Agregar columna fecha_limite_registro
ALTER TABLE asistencia ADD COLUMN IF NOT EXISTS fecha_limite_registro DATE;

-- Agregar columna hora_programada
ALTER TABLE asistencia ADD COLUMN IF NOT EXISTS hora_programada TIME;

-- Agregar columna dia_semana
ALTER TABLE asistencia ADD COLUMN IF NOT EXISTS dia_semana INTEGER;

-- Índices para búsquedas de días obligatorios
CREATE INDEX IF NOT EXISTS idx_asistencia_tipo_dia ON asistencia(tipo_dia);
CREATE INDEX IF NOT EXISTS idx_asistencia_dia_semana ON asistencia(dia_semana);
CREATE INDEX IF NOT EXISTS idx_asistencia_tiene_retraso ON asistencia(tiene_retraso);
