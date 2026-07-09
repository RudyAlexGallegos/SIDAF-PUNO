-- 045_create_solicitud_permiso.sql
-- Tabla de solicitudes de permisos adicionales
-- Compatible con PostgreSQL

CREATE TABLE IF NOT EXISTS solicitud_permiso (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    permiso_id BIGINT NOT NULL,
    descripcion TEXT NOT NULL COMMENT 'Motivo por el cual se solicita el permiso',
    estado VARCHAR(20) DEFAULT 'PENDIENTE' COMMENT 'Estado: PENDIENTE, APROBADA, RECHAZADA',
    solicitado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    respondido_en TIMESTAMP NULL,
    respondido_por BIGINT COMMENT 'ID de quien aprobó/rechazó',
    razon_rechazo TEXT COMMENT 'Razón del rechazo (si aplica)',

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE,
    FOREIGN KEY (respondido_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_solicitud_permiso_usuario_id ON solicitud_permiso(usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitud_permiso_estado ON solicitud_permiso(estado);
CREATE INDEX IF NOT EXISTS idx_solicitud_permiso_solicitado_en ON solicitud_permiso(solicitado_en);
CREATE INDEX IF NOT EXISTS idx_solicitud_permiso_respondido_en ON solicitud_permiso(respondido_en);
