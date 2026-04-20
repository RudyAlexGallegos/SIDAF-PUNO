-- Script de inicialización que Spring Boot ejecutará automáticamente
-- Ubicación: backend/src/main/resources/data.sql
-- Este script se ejecuta DESPUÉS de que Hibernate crea las tablas (ddl-auto=update)

-- ============================================================
-- MIGRACIÓN: Actualizar estructura de roles
-- Se ejecuta automáticamente al iniciar la aplicación
-- ============================================================

-- 1. Actualizar UNIDAD_TECNICA_CODAR → UNIDAD_TECNICA
UPDATE usuarios SET rol = 'UNIDAD_TECNICA' 
WHERE rol = 'UNIDAD_TECNICA_CODAR';

-- 2. Actualizar PRESIDENCIA_CODAR → PRESIDENCIA
UPDATE usuarios SET rol = 'PRESIDENCIA' 
WHERE rol = 'PRESIDENCIA_CODAR';

-- 3. Actualizar CODAR → UNIDAD_TECNICA
UPDATE usuarios SET rol = 'UNIDAD_TECNICA' 
WHERE rol = 'CODAR';

-- 4. Crear índice de optimización (si no existe)
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
