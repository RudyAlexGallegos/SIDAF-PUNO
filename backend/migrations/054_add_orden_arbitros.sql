-- Migración 054: Añadir campo orden a arbitros y poblar con el orden de visualización
-- Sistema SIDAF-PUNO
-- Compatible con PostgreSQL

ALTER TABLE arbitros ADD COLUMN IF NOT EXISTS orden INTEGER;

UPDATE arbitros SET orden = 1 WHERE id = 2;   -- MG MAQUERA GEDEÓN
UPDATE arbitros SET orden = 2 WHERE id = 3;   -- FJ FLORES JOSÉ
UPDATE arbitros SET orden = 3 WHERE id = 5;   -- QN QUISPE NESTOR
UPDATE arbitros SET orden = 4 WHERE id = 6;   -- DM DIAZ MÁXIMO
UPDATE arbitros SET orden = 5 WHERE id = 7;   -- BR BONIFACIO RUBEN
UPDATE arbitros SET orden = 6 WHERE id = 8;   -- AE ACHATA EFRAIN R.
UPDATE arbitros SET orden = 7 WHERE id = 9;   -- EL ESPINOZA LENIN ABEL
UPDATE arbitros SET orden = 8 WHERE id = 10;  -- SA SALAS ARMANDO
UPDATE arbitros SET orden = 9 WHERE id = 11;  -- SG SUCARI GUSTAVO ANGEL
UPDATE arbitros SET orden = 10 WHERE id = 12; -- GW GUITERREZ WILSON
UPDATE arbitros SET orden = 11 WHERE id = 13; -- GZ GONZA ZAYDA MAGALY
UPDATE arbitros SET orden = 12 WHERE id = 14; -- LE LUNA EDGAR
UPDATE arbitros SET orden = 13 WHERE id = 15; -- CH CHAMBILLA HEBER
UPDATE arbitros SET orden = 14 WHERE id = 16; -- PH PINO HENRY
UPDATE arbitros SET orden = 15 WHERE id = 17; -- SW SUAREZ WALTER
UPDATE arbitros SET orden = 16 WHERE id = 18; -- CE CONDORI ELISBAN LUIS
UPDATE arbitros SET orden = 17 WHERE id = 19; -- QP QUISPE PERCY
UPDATE arbitros SET orden = 18 WHERE id = 20; -- LD LARICO DYLAND ETNIEL
UPDATE arbitros SET orden = 19 WHERE id = 21; -- GD GONZALO DARWIN JHOEL
UPDATE arbitros SET orden = 20 WHERE id = 22; -- GR GALLEGOS RUDY ALEX
UPDATE arbitros SET orden = 21 WHERE id = 23; -- SJ SALAMANCA JHON
UPDATE arbitros SET orden = 22 WHERE id = 24; -- MC MUÑOZ CESAR LUIS
UPDATE arbitros SET orden = 23 WHERE id = 25; -- SC SALAMANCA CLINTON
UPDATE arbitros SET orden = 24 WHERE id = 26; -- BJ BERNERDO JHONATAN
UPDATE arbitros SET orden = 25 WHERE id = 27; -- AD ANCHAPURI DAVID
UPDATE arbitros SET orden = 26 WHERE id = 28; -- QL QUISPE LAYDI SHAHIRA
UPDATE arbitros SET orden = 27 WHERE id = 29; -- CN CAHUI NOE
UPDATE arbitros SET orden = 28 WHERE id = 30; -- CE CRUZ EDGAR
UPDATE arbitros SET orden = 29 WHERE id = 31; -- SR SAYHUA ROMAN
UPDATE arbitros SET orden = 30 WHERE id = 1;  -- CW CENTENO WILBER
UPDATE arbitros SET orden = 31 WHERE id = 32; -- CY CATACORA YASLEY
UPDATE arbitros SET orden = 32 WHERE id = 4;  -- CA CENTENO ALDO BLADIMIRO
