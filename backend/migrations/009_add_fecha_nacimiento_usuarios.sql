-- Agregar campos de fecha de nacimiento, es ex-árbitros y especialidad a usuarios
-- Fecha: 2026-02-28

-- Agregar columna fecha_nacimiento
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_nacimiento VARCHAR(20);

-- Agregar columna es_ex_arbitros
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS es_ex_arbitros BOOLEAN DEFAULT false;

-- Agregar columna especialidad
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS especialidad VARCHAR(150);

-- Actualizar registros existentes con valores por defecto
UPDATE usuarios SET es_ex_arbitros = false WHERE es_ex_arbitros IS NULL;
