-- Script para eliminar todos los usuarios excepto el Admin
-- Ejecutar en PostgreSQL (usando pgAdmin o psql)

-- Conectar a la base de datos y ejecutar:

-- Eliminar todos los usuarios (cuidado: esto borra todo)
DELETE FROM usuarios;

-- O si quieres mantener el admin y solo borrar otros:
-- DELETE FROM usuarios WHERE rol != 'ADMIN';

-- Verificar usuarios eliminados
SELECT * FROM usuarios;
