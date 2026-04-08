-- Tabla para guardar resultados (campeones/subcampeones) de COPA PERÚ 2026
-- Permite rastrear ganadores por etapa y distrito/provincia

CREATE TABLE IF NOT EXISTS copa_peru_resultados (
    id BIGSERIAL PRIMARY KEY,
    campeonato_id BIGINT NOT NULL REFERENCES campeonatos(id) ON DELETE CASCADE,
    etapa VARCHAR(50) NOT NULL,
    posicion INTEGER NOT NULL CHECK (posicion IN (1, 2)),
    equipo_id BIGINT NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campeonato_id, etapa, posicion, equipo_id)
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_copa_peru_campeonato ON copa_peru_resultados(campeonato_id);
CREATE INDEX IF NOT EXISTS idx_copa_peru_etapa ON copa_peru_resultados(etapa);
CREATE INDEX IF NOT EXISTS idx_copa_peru_equipo ON copa_peru_resultados(equipo_id);
CREATE INDEX IF NOT EXISTS idx_copa_peru_posicion ON copa_peru_resultados(posicion);

-- Comentarios para documentación
COMMENT ON TABLE copa_peru_resultados IS 'Resultados de COPA PERÚ 2026: campeones y subcampeones por etapa (Distrital, Provincial, Departamental)';
COMMENT ON COLUMN copa_peru_resultados.etapa IS 'DISTRITAL, PROVINCIAL, o DEPARTAMENTAL';
COMMENT ON COLUMN copa_peru_resultados.posicion IS '1 = Campeón, 2 = Subcampeón';
