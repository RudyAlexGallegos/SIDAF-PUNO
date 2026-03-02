-- Agregar campos adicionales a la tabla arbitros
-- Migration: 011_add_campos_completos_arbitros.sql

-- Identificación
ALTER TABLE arbitros ADD COLUMN IF NOT EXISTS dni VARCHAR(20);
ALTER TABLE arbitros ADD COLUMN IF NOT EXISTS genero VARCHAR(20);
ALTER TABLE arbitros ADD COLUMN IF NOT EXISTS lugar_nacimiento VARCHAR(255);
ALTER TABLE arbitros ADD COLUMN IF NOT EXISTS estatura VARCHAR(10);
ALTER TABLE arbitros ADD COLUMN IF NOT EXISTS foto TEXT;

-- Ubicación
ALTER TABLE arbitros ADD COLUMN IF NOT EXISTS provincia VARCHAR(100);
ALTER TABLE arbitros ADD COLUMN IF NOT EXISTS distrito VARCHAR(100);

-- Contacto adicional
ALTER TABLE arbitros ADD COLUMN IF NOT EXISTS telefono_emergencia VARCHAR(20);

-- Fechas profesionales
ALTER TABLE arbitros ADD COLUMN IF NOT EXISTS fecha_afiliacion DATE;
ALTER TABLE arbitros ADD COLUMN IF NOT EXISTS fecha_examen_teorico DATE;
ALTER TABLE arbitros ADD COLUMN IF NOT EXISTS fecha_examen_practico DATE;

-- Formación
ALTER TABLE arbitros ADD COLUMN IF NOT EXISTS academia_formadora VARCHAR(255);

-- Roles y especialidades (JSON)
ALTER TABLE arbitros ADD COLUMN IF NOT EXISTS roles TEXT;
ALTER TABLE arbitros ADD COLUMN IF NOT EXISTS especialidades TEXT;

-- Declaración jurada
ALTER TABLE arbitros ADD COLUMN IF NOT EXISTS declaracion_jurada BOOLEAN DEFAULT false;

-- Verificar que se agregaron las columnas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'arbitros' 
ORDER BY ordinal_position;
