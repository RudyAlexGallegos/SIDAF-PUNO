import { PROVINCIAS_PUNO, getProvincias, getDistritosByProvincia, getTodosDistritos, type Provincia, type Distrito } from './provincias-puno';

export type { Provincia, Distrito };
export { getProvincias, getDistritosByProvincia, getTodosDistritos };

/**
 * Obtener distritos de una provincia específica (retorna strings)
 */
export const getDistritosPorProvincia = (provincia: string | undefined): string[] => {
  if (!provincia) return [];
  const provinciaEncontrada = PROVINCIAS_PUNO.find((p) => p.nombre === provincia);
  return provinciaEncontrada ? provinciaEncontrada.distritos.map((d) => d.nombre) : [];
};

/**
 * Export list for backwards compatibility
 */
export const DISTRITOS_PUNO = getDistritosPorProvincia("Puno");
