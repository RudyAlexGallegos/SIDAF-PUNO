-- Migración: Crear tabla Asesores
-- Fecha: 2026-05-15
-- Descripción: Crear tabla para gestionar asesores de árbitros de la comisión

CREATE TABLE IF NOT EXISTS asesores (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    apellido VARCHAR(150) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    especialidad VARCHAR(255),
    estado VARCHAR(50) DEFAULT 'ACTIVO',
    descripcion TEXT,
    foto TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_asesor_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Crear índices para optimización
CREATE INDEX idx_asesores_usuario_id ON asesores(usuario_id);
CREATE INDEX idx_asesores_dni ON asesores(dni);
CREATE INDEX idx_asesores_email ON asesores(email);
CREATE INDEX idx_asesores_estado ON asesores(estado);

-- Verificar estructura
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'asesores' 
ORDER BY ordinal_position;
