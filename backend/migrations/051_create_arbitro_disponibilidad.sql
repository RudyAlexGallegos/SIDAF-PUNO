-- ==============================================
-- MIGRACIÓN 051: Disponibilidad centralizada de árbitros
-- Fecha: 2026-07-15
-- Descripción: Tabla única de ocupación/indisponibilidad de árbitros.
--   Materializa cada bloqueo (por día completo) derivado de una designación
--   CONFIRMADA o registrado manualmente (permiso, lesión, viaje, examen).
--
--   Reglas de negocio implementadas:
--   1. BLOQUEO: al confirmar una designación se inserta una fila BLOQUEADO
--      por cada árbitro (según su rol) para esa fecha. Vale para TODOS los
--      campeonatos (bloqueo global).
--   2. TRAZABILIDAD: se guardan datos denormalizados (campeonato, fecha, hora,
--      rol y "equipo de trabajo") para explicar el motivo de indisponibilidad.
--   3. CONSISTENCIA: el índice único parcial impide, a nivel de motor,
--      dos bloqueos activos del mismo árbitro en la misma fecha (anti doble-reserva).
--
-- NOTA: El proyecto usa Hibernate con ddl-auto=update (sin Flyway). Hibernate
--   crea la tabla desde la entidad JPA ArbitroDisponibilidad. Este script sirve
--   como documentación y para entornos donde se apliquen migraciones manualmente.
--   El índice único parcial se garantiza además en el arranque mediante
--   DisponibilidadConstraintInitializer.
-- ==============================================

CREATE TABLE IF NOT EXISTS arbitro_disponibilidad (
    id BIGSERIAL PRIMARY KEY,
    arbitro_id BIGINT NOT NULL,
    arbitro_nombre VARCHAR(255),
    fecha DATE NOT NULL,
    hora VARCHAR(10),
    tipo VARCHAR(20) NOT NULL DEFAULT 'DESIGNACION',
    estado VARCHAR(20) NOT NULL DEFAULT 'BLOQUEADO',
    designacion_id BIGINT,
    campeonato_id BIGINT,
    campeonato_nombre VARCHAR(255),
    rol VARCHAR(20),
    equipo_trabajo TEXT,
    motivo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices de apoyo para consultas de disponibilidad en tiempo real
CREATE INDEX IF NOT EXISTS idx_arbitro_disp_arbitro ON arbitro_disponibilidad(arbitro_id);
CREATE INDEX IF NOT EXISTS idx_arbitro_disp_fecha ON arbitro_disponibilidad(fecha);
CREATE INDEX IF NOT EXISTS idx_arbitro_disp_designacion ON arbitro_disponibilidad(designacion_id);
CREATE INDEX IF NOT EXISTS idx_arbitro_disp_estado ON arbitro_disponibilidad(estado);
CREATE INDEX IF NOT EXISTS idx_arbitro_disp_arbitro_fecha ON arbitro_disponibilidad(arbitro_id, fecha);

-- GARANTÍA DE CONSISTENCIA (anti doble-reserva):
-- un árbitro solo puede tener UN bloqueo ACTIVO por fecha, global a todos los campeonatos.
-- Índice único PARCIAL: solo aplica a filas en estado 'BLOQUEADO'.
CREATE UNIQUE INDEX IF NOT EXISTS ux_arbitro_disp_bloqueo_dia
    ON arbitro_disponibilidad(arbitro_id, fecha)
    WHERE estado = 'BLOQUEADO';

-- Trigger para mantener updated_at (reutiliza función creada en migración 015)
DROP TRIGGER IF EXISTS trigger_update_arbitro_disp_updated_at ON arbitro_disponibilidad;
CREATE TRIGGER trigger_update_arbitro_disp_updated_at
    BEFORE UPDATE ON arbitro_disponibilidad
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
