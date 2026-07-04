-- Migracion 049: Agregar columnas faltantes en designaciones
-- Fecha: 2026-07-04
-- Descripcion: Alinea tabla designaciones con el modelo JPA Designacion.java

ALTER TABLE designaciones
    ADD COLUMN IF NOT EXISTS temporada INTEGER,
    ADD COLUMN IF NOT EXISTS etapa VARCHAR(20),
    ADD COLUMN IF NOT EXISTS region VARCHAR(100),
    ADD COLUMN IF NOT EXISTS provincia VARCHAR(100),
    ADD COLUMN IF NOT EXISTS distrito VARCHAR(100),
    ADD COLUMN IF NOT EXISTS posicion VARCHAR(50),
    ADD COLUMN IF NOT EXISTS asesor VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_designaciones_temporada ON designaciones(temporada);
CREATE INDEX IF NOT EXISTS idx_designaciones_etapa ON designaciones(etapa);
