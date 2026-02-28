-- Migración: Agregar roles CODAR y campos de perfil
-- Fecha: 2026-02-11

-- 1. Agregar columna perfil_completo si no existe
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS perfil_completo BOOLEAN DEFAULT FALSE;

-- 2. Agregar columna cargo_codar si no existe
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cargo_codar VARCHAR(100);

-- 3. Agregar columna area_codar si no existe
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS area_codar VARCHAR(100);

-- 4. Actualizar usuarios existentes con rol CODAR
-- Primero verificamos si existe el rol actual y lo actualizamos
UPDATE usuarios SET rol = 'CODAR' WHERE rol = 'USUARIO_TECNICO' AND unidad_organizacional LIKE '%CODAR%';

-- 5. Insertar usuario ADMIN si no existe (Rudy Alex)
-- Contraseña: changeme123 (hash bcrypt)
INSERT INTO usuarios (dni, nombre, apellido, email, password, rol, estado, perfil_completo, unidad_organizacional, fecha_registro)
SELECT '12345678', 'Rudy', 'Alex', 'rudy.alex@codar.puno.pe', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'ACTIVO', TRUE, 'CODAR PUNO', NOW()
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE dni = '12345678');

-- 6. Insertar usuario PRESIDENCIA_CODAR si no existe
INSERT INTO usuarios (dni, nombre, apellido, email, password, rol, estado, perfil_completo, unidad_organizacional, fecha_registro)
SELECT '87654321', 'Presidente', 'CODAR', 'presidencia@codar.puno.pe', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PRESIDENCIA_CODAR', 'ACTIVO', TRUE, 'CODAR PUNO', NOW()
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE dni = '87654321');

-- 7. Permisos por defecto para CODAR (en formato JSON)
-- Los permisos específicos se manejan en la columna permisos_especificos

-- 8. Actualizar estado de usuarios existentes a ACTIVO si están en PENDING y tienen perfil completo
UPDATE usuarios SET estado = 'ACTIVO' WHERE estado = 'PENDING' AND perfil_completo = TRUE;

-- Verificar estructura final
SELECT id, dni, nombre, apellido, email, rol, estado, perfil_completo, cargo_codar, area_codar 
FROM usuarios ORDER BY id;
