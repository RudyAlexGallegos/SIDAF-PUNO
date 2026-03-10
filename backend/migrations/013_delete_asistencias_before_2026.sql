-- Eliminar registros de asistencia anteriores a 2026
-- Este script elimina todos los registros de asistencia creados antes del 1 de enero de 2026

-- Ver registros que se eliminarán (solo para verificar)
-- SELECT id, fecha, created_at FROM asistencia WHERE fecha < '2026-01-01';

-- Eliminar registros de asistencia anteriores a 2026
DELETE FROM asistencia WHERE fecha < '2026-01-01';

-- Verificar eliminación
-- SELECT COUNT(*) as registros_restantes FROM asistencia;
-- SELECT fecha, COUNT(*) as cantidad FROM asistencia GROUP BY fecha ORDER BY fecha DESC;
