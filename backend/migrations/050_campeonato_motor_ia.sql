-- ==============================================
-- MIGRACIÓN 050: Infraestructura IA y Motor de Campeonato
-- Fecha: 2026-07-09
-- Descripción: Nuevas tablas para Partidos, Etapas, Evaluaciones,
-- Event Store, Snapshots, AI Dataset y Predicciones
-- ==============================================

-- Tabla: partidos
CREATE TABLE IF NOT EXISTS partidos (
    id BIGSERIAL PRIMARY KEY,
    campeonato_id BIGINT NOT NULL REFERENCES campeonatos(id) ON DELETE CASCADE,
    etapa_id BIGINT,
    equipo_local_id BIGINT,
    equipo_visitante_id BIGINT,
    fecha VARCHAR(20) NOT NULL,
    hora VARCHAR(10),
    estadio VARCHAR(255),
    goles_local INTEGER,
    goles_visitante INTEGER,
    estado VARCHAR(30) NOT NULL DEFAULT 'BORRADOR',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_partidos_campeonato_id ON partidos(campeonato_id);
CREATE INDEX IF NOT EXISTS idx_partidos_etapa_id ON partidos(etapa_id);
CREATE INDEX IF NOT EXISTS idx_partidos_estado ON partidos(estado);
CREATE INDEX IF NOT EXISTS idx_partidos_fecha ON partidos(fecha);

-- Tabla: etapas_campeonato
CREATE TABLE IF NOT EXISTS etapas_campeonato (
    id BIGSERIAL PRIMARY KEY,
    campeonato_id BIGINT NOT NULL REFERENCES campeonatos(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    orden INTEGER NOT NULL,
    tipo_formato VARCHAR(50) NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_inicio DATE,
    fecha_fin DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_etapas_campeonato_id ON etapas_campeonato(campeonato_id);
CREATE INDEX IF NOT EXISTS idx_etapas_activa ON etapas_campeonato(activa);

-- Tabla: evaluaciones
CREATE TABLE IF NOT EXISTS evaluaciones (
    id BIGSERIAL PRIMARY KEY,
    designacion_id BIGINT NOT NULL,
    arbitro_id BIGINT NOT NULL,
    campeonato_id BIGINT NOT NULL REFERENCES campeonatos(id) ON DELETE CASCADE,
    etapa VARCHAR(50),
    puntaje_tecnico INTEGER DEFAULT 0,
    puntaje_fisico INTEGER DEFAULT 0,
    puntaje_tactico INTEGER DEFAULT 0,
    puntaje_disciplina INTEGER DEFAULT 0,
    puntaje_gestion INTEGER DEFAULT 0,
    puntaje_total INTEGER DEFAULT 0,
    comentarios TEXT,
    evaluado_por BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_evaluaciones_designacion_id ON evaluaciones(designacion_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_arbitro_id ON evaluaciones(arbitro_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_campeonato_id ON evaluaciones(campeonato_id);

-- Tabla: observaciones_partido
CREATE TABLE IF NOT EXISTS observaciones_partido (
    id BIGSERIAL PRIMARY KEY,
    partido_id BIGINT NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
    designacion_id BIGINT,
    usuario_id BIGINT,
    descripcion TEXT NOT NULL,
    tipo_observacion VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_observaciones_partido_id ON observaciones_partido(partido_id);
CREATE INDEX IF NOT EXISTS idx_observaciones_designacion_id ON observaciones_partido(designacion_id);

-- Tabla: eventos_campeonato (Event Store)
CREATE TABLE IF NOT EXISTS eventos_campeonato (
    id BIGSERIAL PRIMARY KEY,
    entidad_tipo VARCHAR(50) NOT NULL,
    entidad_id BIGINT NOT NULL,
    evento VARCHAR(50) NOT NULL,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50),
    usuario_id BIGINT,
    fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT
);

CREATE INDEX IF NOT EXISTS idx_eventos_entidad ON eventos_campeonato(entidad_tipo, entidad_id);
CREATE INDEX IF NOT EXISTS idx_eventos_evento ON eventos_campeonato(evento);
CREATE INDEX IF NOT EXISTS idx_eventos_usuario_id ON eventos_campeonato(usuario_id);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha_evento ON eventos_campeonato(fecha_evento);

-- Tabla: arbitro_snapshot
CREATE TABLE IF NOT EXISTS arbitro_snapshot (
    id BIGSERIAL PRIMARY KEY,
    arbitro_id BIGINT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    apellido VARCHAR(150),
    dni VARCHAR(20),
    genero VARCHAR(20),
    provincia VARCHAR(100),
    distrito VARCHAR(100),
    categoria VARCHAR(50) NOT NULL,
    especialidad VARCHAR(255),
    estado VARCHAR(50),
    experiencia INTEGER,
    nivel_preparacion VARCHAR(50),
    disponible BOOLEAN,
    fecha_snapshot TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_arbitro_snapshot_arbitro_id ON arbitro_snapshot(arbitro_id);
CREATE INDEX IF NOT EXISTS idx_arbitro_snapshot_fecha ON arbitro_snapshot(fecha_snapshot);

-- Tabla: equipo_snapshot
CREATE TABLE IF NOT EXISTS equipo_snapshot (
    id BIGSERIAL PRIMARY KEY,
    equipo_id INTEGER NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    provincia VARCHAR(100),
    distrito VARCHAR(100),
    estadio VARCHAR(255),
    direccion VARCHAR(255),
    telefono VARCHAR(20),
    email VARCHAR(255),
    fecha_snapshot TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_equipo_snapshot_equipo_id ON equipo_snapshot(equipo_id);
CREATE INDEX IF NOT EXISTS idx_equipo_snapshot_fecha ON equipo_snapshot(fecha_snapshot);

-- Tabla: campeonato_snapshot
CREATE TABLE IF NOT EXISTS campeonato_snapshot (
    id BIGSERIAL PRIMARY KEY,
    campeonato_id BIGINT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    tipo VARCHAR(100),
    fecha_inicio VARCHAR(20),
    fecha_fin VARCHAR(20),
    estado VARCHAR(20) NOT NULL,
    provincia VARCHAR(100),
    nivel_dificultad VARCHAR(50),
    numero_equipos INTEGER,
    formato VARCHAR(100),
    fecha_snapshot TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_campeonato_snapshot_campeonato_id ON campeonato_snapshot(campeonato_id);
CREATE INDEX IF NOT EXISTS idx_campeonato_snapshot_fecha ON campeonato_snapshot(fecha_snapshot);

-- Tabla: dataset_config
CREATE TABLE IF NOT EXISTS dataset_config (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    formato_salida VARCHAR(20) NOT NULL,
    campeonato_id BIGINT,
    fecha_desde VARCHAR(20),
    fecha_hasta VARCHAR(20),
    incluir_arbitros BOOLEAN DEFAULT TRUE,
    incluir_equipos BOOLEAN DEFAULT TRUE,
    incluir_partidos BOOLEAN DEFAULT TRUE,
    incluir_evaluaciones BOOLEAN DEFAULT TRUE,
    incluir_designaciones BOOLEAN DEFAULT TRUE,
    incluir_asistencias BOOLEAN DEFAULT TRUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dataset_config_campeonato_id ON dataset_config(campeonato_id);
CREATE INDEX IF NOT EXISTS idx_dataset_config_activo ON dataset_config(activo);

-- Tabla: model_version
CREATE TABLE IF NOT EXISTS model_version (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    descripcion TEXT,
    tipo_modelo VARCHAR(50) NOT NULL,
    fecha_entrenamiento TIMESTAMP,
    metricas TEXT,
    ruta_archivo VARCHAR(500),
    activo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_model_version_tipo_modelo ON model_version(tipo_modelo);
CREATE INDEX IF NOT EXISTS idx_model_version_activo ON model_version(activo);

-- Tabla: predicciones
CREATE TABLE IF NOT EXISTS predicciones (
    id BIGSERIAL PRIMARY KEY,
    model_version_id BIGINT NOT NULL,
    partido_id BIGINT,
    campeonato_id BIGINT NOT NULL REFERENCES campeonatos(id) ON DELETE CASCADE,
    etapa VARCHAR(50),
    arbitro_id BIGINT,
    prediccion TEXT,
    confianza DOUBLE PRECISION,
    metadatos TEXT,
    fecha_prediccion TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_predicciones_model_version_id ON predicciones(model_version_id);
CREATE INDEX IF NOT EXISTS idx_predicciones_campeonato_id ON predicciones(campeonato_id);
CREATE INDEX IF NOT EXISTS idx_predicciones_arbitro_id ON predicciones(arbitro_id);

-- Tabla: prediccion_historial
CREATE TABLE IF NOT EXISTS prediccion_historial (
    id BIGSERIAL PRIMARY KEY,
    prediccion_id BIGINT NOT NULL,
    partido_id BIGINT,
    campeonato_id BIGINT NOT NULL REFERENCES campeonatos(id) ON DELETE CASCADE,
    etapa VARCHAR(50),
    arbitro_id BIGINT,
    resultado_real TEXT,
    prediccion TEXT,
    confianza DOUBLE PRECISION,
    error DOUBLE PRECISION,
    fecha_prediccion TIMESTAMP,
    fecha_resultado TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prediccion_historial_campeonato_id ON prediccion_historial(campeonato_id);
CREATE INDEX IF NOT EXISTS idx_prediccion_historial_arbitro_id ON prediccion_historial(arbitro_id);
CREATE INDEX IF NOT EXISTS idx_prediccion_historial_fecha_prediccion ON prediccion_historial(fecha_prediccion);

-- Trigger para actualizar updated_at en partidos
CREATE OR REPLACE FUNCTION update_partidos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_partidos_updated_at ON partidos;
CREATE TRIGGER trigger_update_partidos_updated_at
    BEFORE UPDATE ON partidos
    FOR EACH ROW
    EXECUTE FUNCTION update_partidos_updated_at();

-- Trigger para actualizar updated_at en etapas_campeonato
DROP TRIGGER IF EXISTS trigger_update_etapas_updated_at ON etapas_campeonato;
CREATE TRIGGER trigger_update_etapas_updated_at
    BEFORE UPDATE ON etapas_campeonato
    FOR EACH ROW
    EXECUTE FUNCTION update_partidos_updated_at();

-- Trigger para actualizar updated_at en evaluaciones
DROP TRIGGER IF EXISTS trigger_update_evaluaciones_updated_at ON evaluaciones;
CREATE TRIGGER trigger_update_evaluaciones_updated_at
    BEFORE UPDATE ON evaluaciones
    FOR EACH ROW
    EXECUTE FUNCTION update_partidos_updated_at();

-- Trigger para actualizar updated_at en observaciones_partido
DROP TRIGGER IF EXISTS trigger_update_observaciones_updated_at ON observaciones_partido;
CREATE TRIGGER trigger_update_observaciones_updated_at
    BEFORE UPDATE ON observaciones_partido
    FOR EACH ROW
    EXECUTE FUNCTION update_partidos_updated_at();
