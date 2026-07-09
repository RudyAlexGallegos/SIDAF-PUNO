-- 040_create_roles.sql
-- Tabla de roles del sistema SIDAF PUNO
-- Compatible con PostgreSQL

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL COMMENT 'Nombre del rol: ADMINISTRADOR, PRESIDENCIA, COMISIÓN_CODAR, UNIDAD_TÉCNICA',
    descripcion TEXT COMMENT 'Descripción del rol',
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' COMMENT 'Estado: ACTIVO, INACTIVO',
    jerarquia INT NOT NULL COMMENT 'Nivel de jerarquía: 1=ADMIN, 2=PRESIDENCIA, 3=CODAR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_roles_estado ON roles(estado);
CREATE INDEX IF NOT EXISTS idx_roles_jerarquia ON roles(jerarquia);

-- Insertar roles base del sistema
INSERT INTO roles (nombre, descripcion, estado, jerarquia) VALUES
('ADMINISTRADOR', 'Administrador del sistema - Acceso total', 'ACTIVO', 1),
('PRESIDENCIA', 'Presidencia de la Comisión de Árbitros', 'ACTIVO', 2),
('COMISIÓN_CODAR', 'Comisión CODAR - Usuario estándar', 'ACTIVO', 3),
('UNIDAD_TÉCNICA', 'Unidad Técnica CODAR - Usuario estándar', 'ACTIVO', 3)
ON CONFLICT (nombre) DO UPDATE SET estado='ACTIVO';
