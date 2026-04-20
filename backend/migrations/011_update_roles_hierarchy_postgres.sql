-- ============================================================
-- MIGRACIÓN: Actualizar estructura de roles a jerarquía simplificada
-- BASE DE DATOS: PostgreSQL (Neon)
-- FECHA: 2026-04-20
-- ============================================================
-- CAMBIOS:
-- - CODAR → UNIDAD_TECNICA
-- - PRESIDENCIA_CODAR → PRESIDENCIA
-- - UNIDAD_TECNICA_CODAR → UNIDAD_TECNICA
-- ============================================================

-- 1. Actualizar tabla de usuarios - reemplazar UNIDAD_TECNICA_CODAR por UNIDAD_TECNICA
UPDATE usuarios SET rol = 'UNIDAD_TECNICA' WHERE rol = 'UNIDAD_TECNICA_CODAR';

-- 2. Actualizar tabla de usuarios - reemplazar PRESIDENCIA_CODAR por PRESIDENCIA
UPDATE usuarios SET rol = 'PRESIDENCIA' WHERE rol = 'PRESIDENCIA_CODAR';

-- 3. Actualizar tabla de usuarios - reemplazar CODAR por UNIDAD_TECNICA
UPDATE usuarios SET rol = 'UNIDAD_TECNICA' WHERE rol = 'CODAR';

-- 4. Verificar que no hay más valores viejos
-- SELECT DISTINCT rol FROM usuarios;
-- Resultado esperado: ADMIN, PRESIDENCIA, UNIDAD_TECNICA

-- ============================================================
-- NUEVA ESTRUCTURA JERÁRQUICA:
-- ============================================================
-- ADMIN (ID: 1, Jerarquía: 1)
--   ├─ Acceso TOTAL a TODO
--   └─ Otorga permisos a PRESIDENCIA y UNIDAD_TECNICA
--
-- PRESIDENCIA (ID: 2, Jerarquía: 2)
--   ├─ Acceso a módulos que ADMIN otorgue
--   ├─ Puede aprobar/rechazar usuarios
--   ├─ Puede asignar permisos a UNIDAD_TECNICA
--   └─ Acceso limitado a reportes de su unidad
--
-- UNIDAD_TECNICA (ID: 3, Jerarquía: 3)
--   ├─ Acceso SOLO a módulos que ADMIN o PRESIDENCIA otorguen
--   ├─ NO puede gestionar usuarios
--   ├─ NO puede cambiar roles
--   └─ Puede solicitar permisos adicionales
-- ============================================================

-- 5. Crear índice si no existe para optimizar búsquedas por rol
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- 6. Verificar integridad de datos
-- SELECT COUNT(*) as total_usuarios, rol, COUNT(*) as por_rol 
-- FROM usuarios 
-- GROUP BY rol 
-- ORDER BY rol;
