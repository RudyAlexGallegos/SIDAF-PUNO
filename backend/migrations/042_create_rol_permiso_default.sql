-- 042_create_rol_permiso_default.sql
-- Tabla de permisos por defecto de cada rol
-- Compatible con PostgreSQL

CREATE TABLE IF NOT EXISTS rol_permiso_default (
    id BIGSERIAL PRIMARY KEY,
    rol_id BIGINT NOT NULL,
    permiso_id BIGINT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' COMMENT 'Estado: ACTIVO, INACTIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE,
    UNIQUE (rol_id, permiso_id)
);

CREATE INDEX IF NOT EXISTS idx_rol_permiso_default_rol_id ON rol_permiso_default(rol_id);
CREATE INDEX IF NOT EXISTS idx_rol_permiso_default_permiso_id ON rol_permiso_default(permiso_id);

-- ADMINISTRADOR: Todos los permisos
INSERT INTO rol_permiso_default (rol_id, permiso_id, estado)
SELECT r.id, p.id, 'ACTIVO'
FROM roles r, permisos p
WHERE r.nombre = 'ADMINISTRADOR'
ON CONFLICT (rol_id, permiso_id) DO UPDATE SET estado='ACTIVO';

-- PRESIDENCIA: Permisos específicos
INSERT INTO rol_permiso_default (rol_id, permiso_id, estado)
SELECT r.id, p.id, 'ACTIVO'
FROM roles r, permisos p
WHERE r.nombre = 'PRESIDENCIA'
AND p.codigo IN (
    'arbitros_ver', 'arbitros_crear', 'arbitros_editar', 'arbitros_exportar',
    'asistencia_registrar', 'asistencia_ver_general', 'asistencia_exportar',
    'designaciones_ver_todas', 'designaciones_crear', 'designaciones_editar', 'designaciones_inteligente',
    'campeonatos_ver', 'campeonatos_crear', 'campeonatos_editar',
    'equipos_ver', 'equipos_crear', 'equipos_editar',
    'reportes_basicos', 'reportes_avanzados', 'reportes_exportar'
)
ON CONFLICT (rol_id, permiso_id) DO UPDATE SET estado='ACTIVO';

-- COMISIÓN_CODAR & UNIDAD_TÉCNICA: Sin permisos iniciales (se asignan dinámicamente)
-- Los permisos se asignan dinámicamente cuando PRESIDENCIA aprueba al usuario
