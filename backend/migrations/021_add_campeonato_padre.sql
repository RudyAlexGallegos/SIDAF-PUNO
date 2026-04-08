-- Agregar soporte para estructura jerárquica de campeonatos (COPA PERÚ 2026)
-- Permite vincular campeonatos padre-hijo (ej: COPA PERÚ PUNO 2026 → Campeonato Distrital Puno)

ALTER TABLE campeonatos
ADD COLUMN IF NOT EXISTS campeonato_padre_id BIGINT REFERENCES campeonatos(id) ON DELETE SET NULL;

-- Índice para buscar campeonatos hijos por padre
CREATE INDEX IF NOT EXISTS idx_campeonatos_padre_id ON campeonatos(campeonato_padre_id);

-- Comentario para documentación
COMMENT ON COLUMN campeonatos.campeonato_padre_id IS 'ID del campeonato padre en estructura jerárquica COPA PERÚ. NULL si es campeonato independiente.';
