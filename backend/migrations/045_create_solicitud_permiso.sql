-- 045_create_solicitud_permiso.sql
-- Tabla de solicitudes de permisos adicionales

CREATE TABLE IF NOT EXISTS solicitud_permiso (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
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
    FOREIGN KEY (respondido_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_estado (estado),
    INDEX idx_solicitado_en (solicitado_en),
    INDEX idx_respondido_en (respondido_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
