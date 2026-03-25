-- Create designaciones table
CREATE TABLE IF NOT EXISTS designaciones (
    id BIGSERIAL PRIMARY KEY,
    partido_id VARCHAR(255),
    id_campeonato BIGINT,
    nombre_campeonato VARCHAR(255),
    id_equipo_local BIGINT,
    nombre_equipo_local VARCHAR(255),
    id_equipo_visitante BIGINT,
    nombre_equipo_visitante VARCHAR(255),
    fecha VARCHAR(20) NOT NULL,
    hora VARCHAR(10),
    estadio VARCHAR(255),
    arbitro_principal VARCHAR(255),
    arbitro_asistente_1 VARCHAR(255),
    arbitro_asistente_2 VARCHAR(255),
    cuarto_arbitro VARCHAR(255),
    posicion VARCHAR(50),
    estado VARCHAR(20) DEFAULT 'PROGRAMADA',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_designaciones_campeonato ON designaciones(id_campeonato);
CREATE INDEX IF NOT EXISTS idx_designaciones_estado ON designaciones(estado);
CREATE INDEX IF NOT EXISTS idx_designaciones_fecha ON designaciones(fecha);
CREATE INDEX IF NOT EXISTS idx_designaciones_arbitro_principal ON designaciones(arbitro_principal);
CREATE INDEX IF NOT EXISTS idx_designaciones_arbitro_asistente1 ON designaciones(arbitro_asistente_1);
CREATE INDEX IF NOT EXISTS idx_designaciones_arbitro_asistente2 ON designaciones(arbitro_asistente_2);
CREATE INDEX IF NOT EXISTS idx_designaciones_cuarto_arbitro ON designaciones(cuarto_arbitro);
CREATE INDEX IF NOT EXISTS idx_designaciones_equipo_local ON designaciones(id_equipo_local);
CREATE INDEX IF NOT EXISTS idx_designaciones_equipo_visitante ON designaciones(id_equipo_visitante);
CREATE INDEX IF NOT EXISTS idx_designaciones_created_at ON designaciones(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_designaciones_updated_at
    BEFORE UPDATE ON designaciones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
