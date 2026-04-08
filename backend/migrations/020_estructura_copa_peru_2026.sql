-- Migración para agregar estructura COPA PERÚ 2026 a designaciones
-- Fecha: 2026-04-08

ALTER TABLE designaciones ADD COLUMN IF NOT EXISTS temporada INTEGER DEFAULT 2026;
ALTER TABLE designaciones ADD COLUMN IF NOT EXISTS etapa VARCHAR(50) DEFAULT 'DISTRITAL';
ALTER TABLE designaciones ADD COLUMN IF NOT EXISTS region VARCHAR(100);
ALTER TABLE designaciones ADD COLUMN IF NOT EXISTS provincia VARCHAR(100);
ALTER TABLE designaciones ADD COLUMN IF NOT EXISTS distrito VARCHAR(100);

-- Comentarios explicativos para la estructura
COMMENT ON COLUMN designaciones.temporada IS 'Año de la temporada, ej: 2026';
COMMENT ON COLUMN designaciones.etapa IS 'Etapa del torneo: DISTRITAL, PROVINCIAL, DEPARTAMENTAL';
COMMENT ON COLUMN designaciones.region IS 'Región/Departamento del Perú (24 regiones)';
COMMENT ON COLUMN designaciones.provincia IS 'Provincia dentro de la región';
COMMENT ON COLUMN designaciones.distrito IS 'Distrito dentro de la provincia (Etapa Distrital)';
