-- 043_create_usuario_permiso_dinamico.sql
-- Tabla de permisos dinámicos asignados a usuarios
-- Compatible con PostgreSQL

CREATE TABLE IF NOT EXISTS usuario_permiso_dinamico (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    permiso_id BIGINT NOT NULL,
    asignado_por BIGINT NOT NULL COMMENT 'ID del usuario PRESIDENCIA que asignó',
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NULL COMMENT 'Para permisos temporales (NULL = sin expiración)',
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' COMMENT 'Estado: ACTIVO, REVOCADO',
    notas TEXT COMMENT 'Notas sobre el permiso',

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE,
    FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    UNIQUE (usuario_id, permiso_id)
);

CREATE INDEX IF NOT EXISTS idx_usuario_permiso_dinamico_usuario_id ON usuario_permiso_dinamico(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_permiso_dinamico_permiso_id ON usuario_permiso_dinamico(permiso_id);
CREATE INDEX IF NOT EXISTS idx_usuario_permiso_dinamico_estado ON usuario_permiso_dinamico(estado);
CREATE INDEX IF NOT EXISTS idx_usuario_permiso_dinamico_fecha_expiracion ON usuario_permiso_dinamico(fecha_expiracion);
