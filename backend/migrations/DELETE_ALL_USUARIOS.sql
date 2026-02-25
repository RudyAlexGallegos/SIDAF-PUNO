-- Script para eliminar TODOS los usuarios
-- Ejecutar en PostgreSQL

-- Eliminar TODOS los usuarios (incluyendo admins) para empezar limpio
DELETE FROM usuario;

-- Verificar que no queden usuarios
SELECT id, dni, nombre, apellido, email, rol, estado FROM usuario;
