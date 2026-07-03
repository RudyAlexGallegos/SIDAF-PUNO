-- ============================================================
-- MIGRACIÓN: Normalizar roles inválidos en tabla usuarios
-- FECHA: 2026-07-03
-- PROBLEMA: Algunos usuarios tienen roles que no existen en el enum
--   Java (PRESIDENTE_SIDAF → PRESIDENCIA, USUARIO_TECNICO → UNIDAD_TECNICA)
-- ============================================================

-- El rol PRESIDENTE_SIDAF se mapea a PRESIDENCIA en la jerarquía nueva.
-- Si se desea mantenerlo, el enum Java ya fue actualizado para incluirlo.
-- Esta migración solo normaliza roles completamente inválidos.

-- Convertir USUARIO_TECNICO → UNIDAD_TECNICA (era un alias antiguo)
UPDATE usuarios 
SET rol = 'UNIDAD_TECNICA' 
WHERE rol = 'USUARIO_TECNICO';

-- Verificar estado final
-- SELECT DISTINCT rol, COUNT(*) as cantidad FROM usuarios GROUP BY rol ORDER BY rol;
