-- 040_create_roles.sql
-- Tabla de roles del sistema SIDAF PUNO

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) UNIQUE NOT NULL COMMENT 'Nombre del rol: ADMINISTRADOR, PRESIDENCIA, COMISIÓN_CODAR, UNIDAD_TÉCNICA',
    descripcion TEXT COMMENT 'Descripción del rol',
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' COMMENT 'Estado: ACTIVO, INACTIVO',
    jerarquia INT NOT NULL COMMENT 'Nivel de jerarquía: 1=ADMIN, 2=PRESIDENCIA, 3=CODAR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_estado (estado),
    INDEX idx_jerarquia (jerarquia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar roles base del sistema
INSERT INTO roles (nombre, descripcion, estado, jerarquia) VALUES
('ADMINISTRADOR', 'Administrador del sistema - Acceso total', 'ACTIVO', 1),
('PRESIDENCIA', 'Presidencia de la Comisión de Árbitros', 'ACTIVO', 2),
('COMISIÓN_CODAR', 'Comisión CODAR - Usuario estándar', 'ACTIVO', 3),
('UNIDAD_TÉCNICA', 'Unidad Técnica CODAR - Usuario estándar', 'ACTIVO', 3)
ON DUPLICATE KEY UPDATE estado='ACTIVO';
