export const DISTRITOS_PUNO = [
    "Puno (Capital)",
    "Ácora",
    "Amantaní",
    "Atuncolla",
    "Capachica",
    "Chucuito",
    "Coata",
    "Huata",
    "Mañazo",
    "Paucarcolla",
    "Pichacani",
    "Platería",
    "San Antonio",
    "Tiquillaca",
    "Vilque"
]

export const getDistritosPorProvincia = (provincia: string | undefined): string[] => {
    // Por ahora solo tenemos distritos para la provincia de Puno
    if (provincia === "Puno") {
        return DISTRITOS_PUNO
    }
    // Para otras provincias, retornamos un array vacío o un mensaje
    return ["Distritos no disponibles para esta provincia"]
}
