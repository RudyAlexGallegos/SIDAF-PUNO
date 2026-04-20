-- 044_create_auditoria_permisos.sql
-- Tabla de auditoría de cambios en permisos y roles

CREATE TABLE IF NOT EXISTS auditoria_permisos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tipo_cambio VARCHAR(50) NOT NULL COMMENT 'Tipo: ASIGNACIÓN, REVOCACIÓN, CAMBIO_ESTADO, CAMBIO_ROL, SOLICITUD_APROBADA, SOLICITUD_RECHAZADA',
    usuario_id BIGINT NOT NULL COMMENT 'ID del usuario que se modifica',
    usuario_afectado_id BIGINT NOT NULL COMMENT 'ID del usuario afectado (puede ser igual a usuario_id)',
    permiso_id BIGINT COMMENT 'ID del permiso (si aplica)',
    rol_anterior VARCHAR(50) COMMENT 'Rol anterior (si hubo cambio)',
    rol_nuevo VARCHAR(50) COMMENT 'Rol nuevo (si hubo cambio)',
    realizado_por BIGINT NOT NULL COMMENT 'ID del usuario que hizo el cambio',
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT COMMENT 'Descripción del cambio',
    razon VARCHAR(255) COMMENT 'Razón del cambio',
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_afectado_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE SET NULL,
    FOREIGN KEY (realizado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_usuario_afectado_id (usuario_afectado_id),
    INDEX idx_fecha_cambio (fecha_cambio),
    INDEX idx_tipo_cambio (tipo_cambio),
    INDEX idx_realizado_por (realizado_por)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
