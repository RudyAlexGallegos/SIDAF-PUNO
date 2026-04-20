-- 041_create_permisos.sql
-- Tabla de permisos granulares del sistema

CREATE TABLE IF NOT EXISTS permisos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(100) UNIQUE NOT NULL COMMENT 'Código único: arbitros_ver, arbitros_crear, etc.',
    nombre VARCHAR(255) NOT NULL COMMENT 'Nombre descriptivo del permiso',
    descripcion TEXT COMMENT 'Descripción detallada',
    modulo VARCHAR(50) NOT NULL COMMENT 'Módulo: arbitros, asistencia, designaciones, campeonatos, equipos, reportes, usuarios',
    accion VARCHAR(50) NOT NULL COMMENT 'Acción: VER, CREAR, EDITAR, ELIMINAR, EXPORTAR, REGISTRAR',
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' COMMENT 'Estado: ACTIVO, INACTIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_modulo (modulo),
    INDEX idx_accion (accion),
    INDEX idx_estado (estado),
    UNIQUE KEY unique_modulo_accion (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar permisos base
INSERT INTO permisos (codigo, nombre, descripcion, modulo, accion, estado) VALUES
-- MÓDULO ARBITROS
('arbitros_ver', 'Ver Árbitros', 'Permiso para ver lista de árbitros', 'arbitros', 'VER', 'ACTIVO'),
('arbitros_crear', 'Crear Arbitro', 'Permiso para crear nuevos árbitros', 'arbitros', 'CREAR', 'ACTIVO'),
('arbitros_editar', 'Editar Arbitro', 'Permiso para editar datos de árbitros', 'arbitros', 'EDITAR', 'ACTIVO'),
('arbitros_eliminar', 'Eliminar Arbitro', 'Permiso para eliminar árbitros', 'arbitros', 'ELIMINAR', 'ACTIVO'),
('arbitros_exportar', 'Exportar Arbitros', 'Permiso para exportar lista de árbitros', 'arbitros', 'EXPORTAR', 'ACTIVO'),

-- MÓDULO ASISTENCIA
('asistencia_registrar', 'Registrar Asistencia', 'Permiso para registrar asistencias', 'asistencia', 'REGISTRAR', 'ACTIVO'),
('asistencia_ver_propio', 'Ver Mi Historial Asistencia', 'Permiso para ver solo mi historial', 'asistencia', 'VER', 'ACTIVO'),
('asistencia_ver_general', 'Ver Historial General Asistencia', 'Permiso para ver historial de todos', 'asistencia', 'VER', 'ACTIVO'),
('asistencia_editar', 'Editar Asistencia', 'Permiso para editar asistencias registradas', 'asistencia', 'EDITAR', 'ACTIVO'),
('asistencia_exportar', 'Exportar Reportes Asistencia', 'Permiso para exportar reportes', 'asistencia', 'EXPORTAR', 'ACTIVO'),

-- MÓDULO DESIGNACIONES
('designaciones_ver_propias', 'Ver Mis Designaciones', 'Permiso para ver solo mis designaciones', 'designaciones', 'VER', 'ACTIVO'),
('designaciones_ver_todas', 'Ver Todas Designaciones', 'Permiso para ver todas las designaciones', 'designaciones', 'VER', 'ACTIVO'),
('designaciones_crear', 'Crear Designación', 'Permiso para crear designaciones', 'designaciones', 'CREAR', 'ACTIVO'),
('designaciones_editar', 'Editar Designación', 'Permiso para editar designaciones', 'designaciones', 'EDITAR', 'ACTIVO'),
('designaciones_eliminar', 'Eliminar Designación', 'Permiso para eliminar designaciones', 'designaciones', 'ELIMINAR', 'ACTIVO'),
('designaciones_inteligente', 'Designación Inteligente', 'Permiso para usar algoritmo de designación automática', 'designaciones', 'CREAR', 'ACTIVO'),

-- MÓDULO CAMPEONATOS
('campeonatos_ver', 'Ver Campeonatos', 'Permiso para ver campeonatos', 'campeonatos', 'VER', 'ACTIVO'),
('campeonatos_crear', 'Crear Campeonato', 'Permiso para crear campeonatos', 'campeonatos', 'CREAR', 'ACTIVO'),
('campeonatos_editar', 'Editar Campeonato', 'Permiso para editar campeonatos', 'campeonatos', 'EDITAR', 'ACTIVO'),
('campeonatos_eliminar', 'Eliminar Campeonato', 'Permiso para eliminar campeonatos', 'campeonatos', 'ELIMINAR', 'ACTIVO'),

-- MÓDULO EQUIPOS
('equipos_ver', 'Ver Equipos', 'Permiso para ver equipos', 'equipos', 'VER', 'ACTIVO'),
('equipos_crear', 'Crear Equipo', 'Permiso para crear equipos', 'equipos', 'CREAR', 'ACTIVO'),
('equipos_editar', 'Editar Equipo', 'Permiso para editar equipos', 'equipos', 'EDITAR', 'ACTIVO'),
('equipos_eliminar', 'Eliminar Equipo', 'Permiso para eliminar equipos', 'equipos', 'ELIMINAR', 'ACTIVO'),

-- MÓDULO REPORTES
('reportes_basicos', 'Ver Reportes Básicos', 'Permiso para ver reportes básicos', 'reportes', 'VER', 'ACTIVO'),
('reportes_avanzados', 'Ver Reportes Avanzados', 'Permiso para ver reportes avanzados', 'reportes', 'VER', 'ACTIVO'),
('reportes_exportar', 'Exportar Reportes', 'Permiso para exportar reportes', 'reportes', 'EXPORTAR', 'ACTIVO'),

-- MÓDULO USUARIOS (ADMIN ONLY)
('usuarios_ver', 'Ver Usuarios', 'Permiso para ver usuarios del sistema', 'usuarios', 'VER', 'ACTIVO'),
('usuarios_crear', 'Crear Usuario', 'Permiso para crear usuarios', 'usuarios', 'CREAR', 'ACTIVO'),
('usuarios_editar', 'Editar Usuario', 'Permiso para editar usuarios', 'usuarios', 'EDITAR', 'ACTIVO'),
('usuarios_eliminar', 'Eliminar Usuario', 'Permiso para eliminar usuarios', 'usuarios', 'ELIMINAR', 'ACTIVO'),

-- MÓDULO ROLES Y PERMISOS (ADMIN ONLY)
('permisos_gestionar', 'Gestionar Permisos', 'Permiso para asignar/revocar permisos a usuarios', 'permisos', 'EDITAR', 'ACTIVO'),
('auditoria_ver_completa', 'Ver Auditoría Completa', 'Permiso para ver auditoría de todo el sistema', 'auditoria', 'VER', 'ACTIVO')
ON DUPLICATE KEY UPDATE estado='ACTIVO';
