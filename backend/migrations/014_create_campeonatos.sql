-- Create campeonatos table
CREATE TABLE IF NOT EXISTS campeonatos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    tipo VARCHAR(100),
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(20) DEFAULT 'PROGRAMADO',
    organizador VARCHAR(255),
    contacto VARCHAR(255),
    ciudad VARCHAR(100),
    provincia VARCHAR(100),
    nivel_dificultad VARCHAR(50),
    numero_equipos INTEGER,
    formato VARCHAR(100),
    reglas TEXT,
    premios TEXT,
    observaciones TEXT,
    logo VARCHAR(500),
    fecha_creacion DATE DEFAULT CURRENT_DATE
);

-- Create campeonato_equipos table for many-to-many relationship
CREATE TABLE IF NOT EXISTS campeonato_equipos (
    campeonato_id BIGINT NOT NULL,
    equipo_id BIGINT NOT NULL,
    PRIMARY KEY (campeonato_id, equipo_id),
    FOREIGN KEY (campeonato_id) REFERENCES campeonatos(id) ON DELETE CASCADE,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campeonatos_estado ON campeonatos(estado);
CREATE INDEX IF NOT EXISTS idx_campeonatos_nivel_dificultad ON campeonatos(nivel_dificultad);
CREATE INDEX IF NOT EXISTS idx_campeonatos_provincia ON campeonatos(provincia);
CREATE INDEX IF NOT EXISTS idx_campeonatos_ciudad ON campeonatos(ciudad);
CREATE INDEX IF NOT EXISTS idx_campeonatos_categoria ON campeonatos(categoria);
CREATE INDEX IF NOT EXISTS idx_campeonatos_fecha_creacion ON campeonatos(fecha_creacion);
