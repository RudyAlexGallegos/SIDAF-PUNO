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
      { nombre: "Ácora" },
      { nombre: "Amantaní" },
      { nombre: "Atuncolla" },
      { nombre: "Capachica" },
      { nombre: "Chucuito" },
      { nombre: "Coata" },
      { nombre: "Huata" },
      { nombre: "Mañazo" },
      { nombre: "Paucarcolla" },
      { nombre: "Pichacani" },
      { nombre: "Platería" },
      { nombre: "San Antonio" },
      { nombre: "Tiquillaca" },
      { nombre: "Vilque" },
    ],
  },
  {
    nombre: "Azángaro",
    codigo: "AZA",
    distritos: [
      { nombre: "Achaya" },
      { nombre: "Arapa" },
      { nombre: "Asillo" },
      { nombre: "Azángaro" },
      { nombre: "Caminaca" },
      { nombre: "Chupa" },
      { nombre: "José Domingo Choquehuanca" },
      { nombre: "Muñani" },
      { nombre: "Potoni" },
      { nombre: "Samán" },
      { nombre: "San Antón" },
      { nombre: "San José" },
      { nombre: "San Juan de Salinas" },
      { nombre: "Santiago de Pupuja" },
      { nombre: "Tirapata" },
    ],
  },
  {
    nombre: "Carabaya",
    codigo: "CAR",
    distritos: [
      { nombre: "Ajoyani" },
      { nombre: "Ayapata" },
      { nombre: "Coasa" },
      { nombre: "Corani" },
      { nombre: "Crucero" },
      { nombre: "Ituata" },
      { nombre: "Macusani" },
      { nombre: "Ollachea" },
      { nombre: "San Gabán" },
      { nombre: "Usicayos" },
    ],
  },
  {
    nombre: "Chucuito",
    codigo: "CHU",
    distritos: [
      { nombre: "Desaguadero" },
      { nombre: "Huacullani" },
      { nombre: "Juli" },
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
      { nombre: "Capaso" },
      { nombre: "Conduriri" },
      { nombre: "Ilave" },
      { nombre: "Pilcuyo" },
      { nombre: "Santa Rosa" },
    ],
  },
  {
    nombre: "Huancané",
    codigo: "HUA",
    distritos: [
      { nombre: "Cojata" },
      { nombre: "Huancané" },
      { nombre: "Inchupalla" },
      { nombre: "Pusi" },
      { nombre: "Rosaspata" },
      { nombre: "Taraco" },
      { nombre: "Vilque Chico" },
      { nombre: "Huatasani" },
    ],
  },
  {
    nombre: "Lampa",
    codigo: "LAM",
    distritos: [
      { nombre: "Cabanilla" },
      { nombre: "Calapuja" },
      { nombre: "Lampa" },
      { nombre: "Nicasio" },
      { nombre: "Ocuviri" },
      { nombre: "Palca" },
      { nombre: "Paratía" },
      { nombre: "Pucará" },
      { nombre: "Santa Lucía" },
      { nombre: "Vila Vila" },
    ],
  },
  {
    nombre: "Melgar",
    codigo: "MEL",
    distritos: [
      { nombre: "Antauta" },
      { nombre: "Ayaviri" },
      { nombre: "Cupi" },
      { nombre: "Llalli" },
      { nombre: "Macari" },
      { nombre: "Ñuñoa" },
      { nombre: "Orurillo" },
      { nombre: "Santa Rosa" },
      { nombre: "Umachiri" },
    ],
  },
  {
    nombre: "Moho",
    codigo: "MOH",
    distritos: [
      { nombre: "Conima" },
      { nombre: "Huayrapata" },
      { nombre: "Moho" },
      { nombre: "Tilali" },
    ],
  },
  {
    nombre: "San Antonio de Putina",
    codigo: "SAP",
    distritos: [
      { nombre: "Ananea" },
      { nombre: "Pedro Vilca Apaza" },
      { nombre: "Putina" },
      { nombre: "Quilcapuncu" },
      { nombre: "Sina" },
    ],
  },
  {
    nombre: "San Román",
    codigo: "SRO",
    distritos: [
      { nombre: "Cabana" },
      { nombre: "Cabanillas" },
      { nombre: "Caracoto" },
      { nombre: "Juliaca" },
      { nombre: "San Miguel" },
    ],
  },
  {
    nombre: "Sandia",
    codigo: "SAN",
    distritos: [
      { nombre: "Alto Inambari" },
      { nombre: "Cuyocuyo" },
      { nombre: "Limbani" },
      { nombre: "Patambuco" },
      { nombre: "Phara" },
      { nombre: "Quiaca" },
      { nombre: "San Juan del Oro" },
      { nombre: "Sandia" },
      { nombre: "Yanahuaya" },
      { nombre: "San Pedro de Putina Punco" },
    ],
  },
  {
    nombre: "Yunguyo",
    codigo: "YUN",
    distritos: [
      { nombre: "Anapia" },
      { nombre: "Copani" },
      { nombre: "Cuturapi" },
      { nombre: "Ollaraya" },
      { nombre: "Unicachi" },
      { nombre: "Yunguyo" },
      { nombre: "El Cápac" },
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
