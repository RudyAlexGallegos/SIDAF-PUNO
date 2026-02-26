-- ============================================================
-- SEED DATA - USUARIOS INICIALES v2
-- SIDAF PUNO - Sistema de Gestión Arbitral
-- ============================================================

-- Primero, verificar qué columnas existen en la tabla
-- Si hay errores, ejecutar solo las partes que funcionan

-- ============================================================
-- 1. Agregar columna 'estado' si no existe
-- ============================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'estado'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN estado VARCHAR(20) DEFAULT 'ACTIVO';
    END IF;
END $$;

-- ============================================================
-- 2. Agregar columna 'unidad_organizacional' si no existe
-- ============================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'unidad_organizacional'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN unidad_organizacional VARCHAR(100);
    END IF;
END $$;

-- ============================================================
-- 3. Agregar columna 'permisos_especificos' si no existe
-- ============================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'permisos_especificos'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN permisos_especificos TEXT;
    END IF;
END $$;

-- ============================================================
-- 4. Agregar columna 'telefono' si no existe
-- ============================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'telefono'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20);
    END IF;
END $$;

-- ============================================================
-- 5. Agregar columna 'fecha_registro' si no existe
-- ============================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'fecha_registro'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN fecha_registro TIMESTAMP;
    END IF;
END $$;

-- ============================================================
-- 6. Agregar columna 'arbitro_id' si no existe
-- ============================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'arbitro_id'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN arbitro_id INTEGER;
    END IF;
END $$;

-- ============================================================
-- 7. Agregar columna 'creado_por' si no existe
-- ============================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'creado_por'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN creado_por INTEGER;
    END IF;
END $$;

-- ============================================================
-- 8. Agregar columna 'ultimo_acceso' si no existe
-- ============================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'ultimo_acceso'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN ultimo_acceso TIMESTAMP;
    END IF;
END $$;

-- ============================================================
-- 9. Agregar columna 'foto' si no existe
-- ============================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'foto'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN foto TEXT;
    END IF;
END $$;

-- ============================================================
-- Insertar usuarios (si no existen)
-- ============================================================

-- USUARIO ADMINISTRADOR
INSERT INTO usuarios (
    dni, nombre, apellido, email, password, rol, estado,
    unidad_organizacional, permisos_especificos, telefono, fecha_registro
) 
SELECT '12345678', 'Administrador', 'SIDAF Puno', 'admin@sidaf-puno.pe', 
       'admin123', 'ADMIN', 'ACTIVO', 'SIDAF PUNO', '["TODOS"]', 
       '951123456', CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE dni = '12345678'
);

-- USUARIO PRESIDENTE SIDAF
INSERT INTO usuarios (
    dni, nombre, apellido, email, password, rol, estado,
    unidad_organizacional, permisos_especificos, telefono, fecha_registro
) 
SELECT '87654321', 'Presidente', 'SIDAF Puno', 'presidente@sidaf-puno.pe', 
       'presi123', 'PRESIDENTE_SIDAF', 'ACTIVO', 'SIDAF PUNO', 
       '["GESTION_ARBITROS", "GESTION_ASISTENCIA", "GESTION_DESIGNACIONES", "GESTION_CAMPEONATOS", "GESTION_EQUIPOS", "VER_REPORTES", "VER_ARBITROS"]', 
       '952123456', CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE dni = '87654321'
);

-- USUARIO ÁRBITRO
INSERT INTO usuarios (
    dni, nombre, apellido, email, password, rol, estado,
    unidad_organizacional, permisos_especificos, telefono, fecha_registro
) 
SELECT '12345679', 'Juan', 'Perez Garcia', 'juan.parez@sidaf-puno.pe', 
       'arbitro123', 'USUARIO_TECNICO', 'ACTIVO', 'SIDAF PUNO', 
       '["GESTION_ASISTENCIA", "VER_ARBITROS"]', 
       '953123456', CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE dni = '12345679'
);

-- ============================================================
-- Verificar usuarios insertados
-- ============================================================
SELECT id, dni, nombre, apellido, email, rol, estado 
FROM usuarios 
ORDER BY id;

-- ============================================================
-- CREDENCIALES DE ACCESO
-- ============================================================
-- ADMINISTRADOR: DNI 12345678, Password: admin123
-- PRESIDENTE: DNI 87654321, Password: presi123
-- ÁRBITRO: DNI 12345679, Password: arbitro123
