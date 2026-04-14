-- Migración: Resetear campeonatos y dejar solo COPA PERÚ 2026
-- Fecha: 2026-04-14
-- Descripción: Elimina todos los campeonatos y crea uno solo: COPA PERÚ 2026

-- Primero, eliminar todas las designaciones relacionadas para evitar conflictos de FK
DELETE FROM designaciones WHERE id_campeonato IS NOT NULL;

-- Luego, eliminar todas las relaciones campeonato_equipos
DELETE FROM campeonato_equipos;

-- Finalmente, eliminar todos los campeonatos
DELETE FROM campeonatos;

-- Reiniciar la secuencia de IDs
ALTER SEQUENCE campeonatos_id_seq RESTART WITH 1;

-- Insertar el campeonato único: COPA PERÚ 2026
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
) VALUES (
    'COPA PERÚ 2026',
    'Nacional',
    'Competencia',
    '2026-04-14'::DATE,
    '2026-12-31'::DATE,
    'EN_PROGRESO',
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
);

-- Confirmación
SELECT 'Migration completed successfully' as mensaje, count(*) as total_campeonatos FROM campeonatos;
