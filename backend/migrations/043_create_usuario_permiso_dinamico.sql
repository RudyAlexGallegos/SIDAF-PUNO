-- 043_create_usuario_permiso_dinamico.sql
-- Tabla de permisos dinámicos asignados a usuarios

CREATE TABLE IF NOT EXISTS usuario_permiso_dinamico (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
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
    UNIQUE KEY unique_usuario_permiso (usuario_id, permiso_id),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_permiso_id (permiso_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_expiracion (fecha_expiracion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
