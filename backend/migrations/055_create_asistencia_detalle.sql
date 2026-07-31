-- Migración 055: Crear tabla asistencia_detalle para marcas individuales por árbitro
-- Sistema SIDAF-PUNO
-- Compatible con PostgreSQL

CREATE TABLE IF NOT EXISTS asistencia_detalle (
    id BIGSERIAL PRIMARY KEY,
    asistencia_id BIGINT NOT NULL REFERENCES asistencia(id) ON DELETE CASCADE,
    arbitro_id BIGINT NOT NULL REFERENCES arbitros(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'ausente',
    hora_registro TIMESTAMP,
    observaciones TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_asistencia_detalle_asistencia ON asistencia_detalle(asistencia_id);
CREATE INDEX IF NOT EXISTS idx_asistencia_detalle_arbitro ON asistencia_detalle(arbitro_id);

-- Tabla temporal para merge manual si ya existiera
CREATE TABLE IF NOT EXISTS asistencia_detalle_tmp (
    id BIGSERIAL PRIMARY KEY,
    asistencia_id BIGINT NOT NULL REFERENCES asistencia(id) ON DELETE CASCADE,
    arbitro_id BIGINT NOT NULL REFERENCES arbitros(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'ausente',
    hora_registro TIMESTAMP,
    observaciones TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
