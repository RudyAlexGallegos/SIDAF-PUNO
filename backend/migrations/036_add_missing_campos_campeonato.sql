-- Migración: Agregar campos faltantes a campeonatos
-- Campos faltantes que el plan indica que deben existir

ALTER TABLE campeonatos 
ADD COLUMN IF NOT EXISTS direccion VARCHAR(255),
ADD COLUMN IF NOT EXISTS estadio VARCHAR(255),
ADD COLUMN IF NOT EXISTS hora_inicio VARCHAR(10),
ADD COLUMN IF NOT EXISTS hora_fin VARCHAR(10),
ADD COLUMN IF NOT EXISTS dias_juego VARCHAR(255),
ADD COLUMN IF NOT EXISTS etapas TEXT;

-- Verificar estructura actualizada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'campeonatos' 
ORDER BY ordinal_position;