-- Create equipos table
CREATE TABLE IF NOT EXISTS equipos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    provincia VARCHAR(100),
    estadio VARCHAR(255),
    direccion TEXT,
    telefono VARCHAR(50),
    email VARCHAR(255),
    colores VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample equipos
INSERT INTO equipos (nombre, categoria, provincia, estadio, colores) VALUES
('Club Deportivo Puno', 'Primera División', 'Puno', 'Estadio Enrique Torres Belón', 'Rojo-Blanco'),
('Sportivo Lucrecia', 'Primera División', 'Puno', 'Estadio Lucrecia', 'Azul-Blanco'),
('César Vallejo', 'Segunda División', 'Juliaca', 'Estadio César Vallejo', 'Verde-Blanco'),
('Universidad Nacional del Altiplano', 'Segunda División', 'Puno', 'Estadio UNAP', 'Azul-Amarillo'),
('Deportivo Zegarra', 'Primera División', 'Juliaca', 'Estadio Zegarra', 'Rojo-Negro'),
('Social Cristal', 'Segunda División', 'Puno', 'Estadio Cristal', 'Azul-Celeste');
