/**
 * Estructura de 13 provincias de Puno con sus distritos
 * Fuente: Oficio de la Regional de Educación de Puno
 */

export interface Distrito {
  nombre: string;
  codigo?: string;
}

export interface Provincia {
  nombre: string;
  codigo: string;
  distritos: Distrito[];
}

export const PROVINCIAS_PUNO: Provincia[] = [
  {
    nombre: "Puno",
    codigo: "PUN",
    distritos: [
      { nombre: "Puno" },
      { nombre: "Acora" },
      { nombre: "Amantaní" },
      { nombre: "Atuncolla" },
      { nombre: "Capachica" },
      { nombre: "Chucuito" },
      { nombre: "Coata" },
      { nombre: "Huata" },
      { nombre: "Mañazo" },
      { nombre: "Platería" },
      { nombre: "Pucará" },
      { nombre: "Tiquillaca" },
      { nombre: " Úcatali" },
    ],
  },
  {
    nombre: "Azángaro",
    codigo: "AZA",
    distritos: [
      { nombre: "Azángaro" },
      { nombre: "Achaya" },
      { nombre: "Arapa" },
      { nombre: "Asillo" },
      { nombre: "Chapa" },
      { nombre: "Muñani" },
      { nombre: "Potoni" },
      { nombre: "San Antón" },
      { nombre: "San José" },
    ],
  },
  {
    nombre: "Carabaya",
    codigo: "CAR",
    distritos: [
      { nombre: "Crucero" },
      { nombre: "Coasa" },
      { nombre: "Iberia" },
      { nombre: "Macusani" },
      { nombre: "San Gabán" },
      { nombre: "Usicayos" },
    ],
  },
  {
    nombre: "Chucuito",
    codigo: "CHU",
    distritos: [
      { nombre: "Chucuito" },
      { nombre: "Kelluyo" },
      { nombre: "Pisacoma" },
      { nombre: "Pomata" },
      { nombre: "Zepita" },
    ],
  },
  {
    nombre: "El Collao",
    codigo: "ECO",
    distritos: [
      { nombre: "Ilave" },
      { nombre: "Capazo" },
      { nombre: "Conduriri" },
      { nombre: "Santa Rosa de Juli" },
    ],
  },
  {
    nombre: "Huancané",
    codigo: "HUA",
    distritos: [
      { nombre: "Huancané" },
      { nombre: "Bocamachi" },
      { nombre: "Cojata" },
      { nombre: "Huata" },
      { nombre: "Inchupalla" },
      { nombre: "Rosaspata" },
      { nombre: "Taraco" },
      { nombre: "Vilque Chico" },
      { nombre: "Vilquechico" },
    ],
  },
  {
    nombre: "Lampa",
    codigo: "LAM",
    distritos: [
      { nombre: "Lampa" },
      { nombre: "Cabanillas" },
      { nombre: "Calapuja" },
      { nombre: "Ocuviri" },
      { nombre: "Paratía" },
      { nombre: "Pucará" },
      { nombre: "Santa Lucía" },
    ],
  },
  {
    nombre: "Melgar",
    codigo: "MEL",
    distritos: [
      { nombre: "Ayaviri" },
      { nombre: "Antauta" },
      { nombre: "Cupi" },
      { nombre: "Llalli" },
      { nombre: "Macarí" },
      { nombre: "Nuñoa" },
      { nombre: "Orurillo" },
      { nombre: "Santa Rosa" },
      { nombre: "Umachiri" },
    ],
  },
  {
    nombre: "Moho",
    codigo: "MOH",
    distritos: [
      { nombre: "Moho" },
      { nombre: "Conima" },
      { nombre: "Huayrapata" },
      { nombre: "Tilali" },
    ],
  },
  {
    nombre: "San Antonio de Putina",
    codigo: "SAP",
    distritos: [
      { nombre: "San Antonio de Putina" },
      { nombre: "Ananea" },
      { nombre: "Ollachea" },
      { nombre: "Quilcapuncu" },
      { nombre: "Sina" },
    ],
  },
  {
    nombre: "Sandia",
    codigo: "SAN",
    distritos: [
      { nombre: "Sandia" },
      { nombre: "Cuyocuyo" },
      { nombre: "Phara" },
      { nombre: "Quiaca" },
      { nombre: "San Juan del Oro" },
      { nombre: "Usicayos" },
      { nombre: "Yarahuaca" },
    ],
  },
  {
    nombre: "Yunguyo",
    codigo: "YUN",
    distritos: [
      { nombre: "Yunguyo" },
      { nombre: "Copacabana" },
      { nombre: "Cuturapi" },
      { nombre: "Ollaraya" },
      { nombre: "Titicaca" },
      { nombre: "Tumupasa" },
    ],
  },
  {
    nombre: "Acora",
    codigo: "ACO",
    distritos: [
      { nombre: "Acora" },
      { nombre: "Abaroa" },
      { nombre: "Amantaní" },
      { nombre: "Ichu" },
    ],
  },
];

/**
 * Obtener distritos de una provincia
 */
export const getDistritosByProvincia = (provinciaNombre: string): Distrito[] => {
  const provincia = PROVINCIAS_PUNO.find((p) => p.nombre === provinciaNombre);
  return provincia ? provincia.distritos : [];
};

/**
 * Obtener todas las provincias
 */
export const getProvincias = (): string[] => {
  return PROVINCIAS_PUNO.map((p) => p.nombre);
};

/**
 * Obtener todos los distritos
 */
export const getTodosDistritos = (): string[] => {
  return PROVINCIAS_PUNO.flatMap((p) => p.distritos.map((d) => d.nombre));
};
