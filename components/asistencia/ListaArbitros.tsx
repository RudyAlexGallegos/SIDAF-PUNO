"use client"

import RegistroCompactoArbitro from "./RegistroCompactoArbitro"
import { Arbitro, EstadoAsistencia, AsistenciaArbitro } from "@/types/asistencia"

export default function ListaArbitros({
    arbitros,
    onChange,
    estadosMap,
}: {
    arbitros: Arbitro[]
    onChange: (id: string, e: EstadoAsistencia, observaciones?: string) => void
    estadosMap?: Record<string, EstadoAsistencia>
}) {
    return (
        <div className="space-y-2">
            {arbitros.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">No se encontraron árbitros para la búsqueda.</div>
            ) : (
                arbitros.map(a => {
                    const estado = estadosMap?.[a.id] ?? ("ausente" as EstadoAsistencia)
                    return (
                        <RegistroCompactoArbitro
                            key={a.id}
                            arbitro={a}
                            estado={estado}
                            onChange={(e, obs) => onChange(a.id, e, obs)}
                        />
                    )
                })
            )}
        </div>
    )
}
