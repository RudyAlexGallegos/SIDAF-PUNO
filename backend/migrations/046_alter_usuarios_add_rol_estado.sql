-- 046_alter_usuarios_add_rol_estado.sql
-- Modificar tabla usuarios para agregar campos de rol y estado

-- Agregar columna rol_id si no existe
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol_id BIGINT AFTER id;

-- Agregar columna estado si no existe
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'ACTIVO' AFTER rol_id
COMMENT 'Estado del usuario: PENDIENTE, ACTIVO, INACTIVO, SUSPENDIDO';

-- Agregar columna fecha_aprobacion si no existe
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_aprobacion DATETIME NULL AFTER estado;

-- Agregar columna aprobado_por si no existe
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS aprobado_por BIGINT NULL AFTER fecha_aprobacion;

-- Agregar foreign key de rol_id
ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_rol_id 
FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE SET NULL;

-- Agregar foreign key de aprobado_por
ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_aprobado_por 
FOREIGN KEY (aprobado_por) REFERENCES usuarios(id) ON DELETE SET NULL;

-- Agregar índices
ALTER TABLE usuarios ADD INDEX IF NOT EXISTS idx_rol_id (rol_id);
ALTER TABLE usuarios ADD INDEX IF NOT EXISTS idx_estado (estado);
ALTER TABLE usuarios ADD INDEX IF NOT EXISTS idx_aprobado_por (aprobado_por);

-- Establecer rol por defecto para usuarios existentes sin rol
-- Los administradores tendrán rol ADMINISTRADOR (id=1)
-- Los demás usuarios tendrán rol COMISIÓN_CODAR (id=3)
UPDATE usuarios u 
SET u.rol_id = 1, u.estado = 'ACTIVO'
WHERE u.rol_id IS NULL AND u.dni = '12345678'; -- Reemplazar con DNI del admin si existe

UPDATE usuarios u
SET u.rol_id = 3, u.estado = 'ACTIVO'
WHERE u.rol_id IS NULL;
