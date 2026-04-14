-- Migración: Asegurar que COPA PERÚ 2026 sea el único campeonato
--Fecha: 2026-04-14
-- Descripción: Verifica que COPA PERÚ 2026 exista, si no, la crea
-- Si existen otros campeonatos, los elimina (exceptuando COPA PERÚ)

BEGIN TRANSACTION;

-- Eliminar campeonatos que NO son COPA PERÚ 2026
DELETE FROM designaciones WHERE id_campeonato NOT IN (
    SELECT id FROM campeonatos WHERE nombre = 'COPA PERÚ 2026'
);

DELETE FROM campeonato_equipos WHERE campeonato_id NOT IN (
    SELECT id FROM campeonatos WHERE nombre = 'COPA PERÚ 2026'
);

DELETE FROM campeonatos WHERE nombre != 'COPA PERÚ 2026';

-- Insertar COPA PERÚ 2026 si no existe
INSERT INTO campeonatos (
    nombre,
    categoria,
    tipo,
    fecha_inicio,
    fecha_fin,
    estado,
    organizador,
    contacto,
    ciudad,
    provincia,
    nivel_dificultad,
    numero_equipos,
    formato,
    reglas,
    premios,
    observaciones,
    fecha_creacion
) 
SELECT 
    'COPA PERÚ 2026',
    'Nacional',
    'Competencia',
    '2026-04-14'::DATE,
    '2026-12-31'::DATE,
    'ACTIVO',
    'Federación Deportiva Nacional Peruana de Fútbol',
    'info@federacionfutbol.pe',
    'Puno',
    'Puno',
    'Alto',
    32,
    'Eliminatoria',
    'Reglamento oficial de la COPA PERÚ 2026',
    'Trofeo Nacional + Premio Económico',
    'Torneo oficial de fútbol profesional del Perú - Temporada 2026',
    CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM campeonatos WHERE nombre = 'COPA PERÚ 2026');

COMMIT TRANSACTION;

-- Verificación final
SELECT 'Migration completed' as status,
       (SELECT COUNT(*) FROM campeonatos) as total_campeonatos,
       (SELECT nombre FROM campeonatos LIMIT 1) as campeonato_activo;
