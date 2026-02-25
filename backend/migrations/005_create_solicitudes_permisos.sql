-- Table for permission requests
CREATE TABLE IF NOT EXISTS solicitud_permiso (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    usuario_nombre VARCHAR(255),
    permiso_solicitado VARCHAR(100) NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP,
    notas TEXT
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_permisos(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_usuario ON solicitudes_permisos(usuario_id);
