-- 047_fix_rol_enum_check.sql
-- Corrige el check constraint de la columna rol en la tabla usuarios
-- para que acepte los valores correctos del enum actual

-- Primero eliminamos el constraint anterior
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;

-- Creamos el constraint con los valores correctos del enum
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check
CHECK (rol IN ('ADMIN', 'PRESIDENCIA', 'UNIDAD_TECNICA'));
