-- ============================================================
-- SEED DATA - USUARIOS INICIALES
-- SIDAF PUNO - Sistema de Gestión Arbitral
-- ============================================================

-- Tabla de usuarios (asegurarse que existe)
-- Nota: Ejecutar primero las migraciones anteriores si no existen las tablas

-- ============================================================
-- USUARIO ADMINISTRADOR
-- ============================================================
INSERT INTO usuarios (
    dni,
    nombre,
    apellido,
    email,
    password,
    rol,
    estado,
    unidad_organizacional,
    permisos_especificos,
    telefono,
    fecha_registro
) VALUES (
    '12345678',
    'Administrador',
    'SIDAF Puno',
    'admin@sidaf-puno.pe',
    'admin123',
    'ADMIN',
    'ACTIVO',
    'SIDAF PUNO',
    '["TODOS"]',
    '951123456',
    CURRENT_TIMESTAMP
);

-- ============================================================
-- USUARIO PRESIDENTE SIDAF
-- ============================================================
INSERT INTO usuarios (
    dni,
    nombre,
    apellido,
    email,
    password,
    rol,
    estado,
    unidad_organizacional,
    permisos_especificos,
    telefono,
    fecha_registro
) VALUES (
    '87654321',
    'Presidente',
    'SIDAF Puno',
    'presidente@sidaf-puno.pe',
    'presi123',
    'PRESIDENTE_SIDAF',
    'ACTIVO',
    'SIDAF PUNO',
    '["GESTION_ARBITROS", "GESTION_ASISTENCIA", "GESTION_DESIGNACIONES", "GESTION_CAMPEONATOS", "GESTION_EQUIPOS", "VER_REPORTES", "VER_ARBITROS"]',
    '952123456',
    CURRENT_TIMESTAMP
);

-- ============================================================
-- USUARIO ÁRBITRO (USUARIO TÉCNICO)
-- ============================================================
INSERT INTO usuarios (
    dni,
    nombre,
    apellido,
    email,
    password,
    rol,
    estado,
    unidad_organizacional,
    permisos_especificos,
    telefono,
    fecha_registro
) VALUES (
    '12345679',
    'Juan',
    'Perez Garcia',
    'juan.parez@sidaf-puno.pe',
    'arbitro123',
    'USUARIO_TECNICO',
    'ACTIVO',
    'SIDAF PUNO',
    '["GESTION_ASISTENCIA", "VER_ARBITROS"]',
    '953123456',
    CURRENT_TIMESTAMP
);

-- ============================================================
-- VERIFICAR QUE SE INSERTARON CORRECTAMENTE
-- ============================================================
SELECT id, dni, nombre, apellido, email, rol, estado 
FROM usuarios 
ORDER BY id;

-- ============================================================
-- CREDENCIALES DE ACCESO
-- ============================================================
-- 
-- ADMINISTRADOR:
--   DNI: 12345678
--   Contraseña: admin123
--
-- PRESIDENTE:
--   DNI: 87654321
--   Contraseña: presi123
--
-- ÁRBITRO:
--   DNI: 12345679
--   Contraseña: arbitro123
--
-- ============================================================
