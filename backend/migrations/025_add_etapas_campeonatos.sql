-- Add etapas column to campeonatos table
ALTER TABLE campeonatos ADD COLUMN IF NOT EXISTS etapas TEXT;
