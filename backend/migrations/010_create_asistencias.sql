-- Migración 010: Crear tabla de asistencias
-- Sistema SIDAF-PUNO
-- Compatible con PostgreSQL

CREATE TABLE IF NOT EXISTS asistencia (
    id BIGSERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora_entrada TIMESTAMP,
    hora_salida TIMESTAMP,
    actividad VARCHAR(255),
    evento VARCHAR(255),
    estado VARCHAR(50),
    observaciones TEXT,
    latitude VARCHAR(50),
    longitude VARCHAR(50),
    responsable_id BIGINT,
    responsable VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_asistencia_fecha ON asistencia(fecha);
CREATE INDEX idx_asistencia_actividad ON asistencia(actividad);
CREATE INDEX idx_asistencia_estado ON asistencia(estado);
