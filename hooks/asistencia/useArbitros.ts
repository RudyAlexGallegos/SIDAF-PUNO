"use client"

import { useEffect, useState } from "react"

export function useArbitros() {
    const [arbitros, setArbitros] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Datos ficticios para pruebas UI — se reemplazará por fetch real luego
        const mock = [
            { id: 'A001', nombre: 'Luis', apellido: 'Quispe', dni: '71654321', categoria: 'Nacional' },
            { id: 'A002', nombre: 'María', apellido: 'Salgado', dni: '70432109', categoria: 'Departamental' },
            { id: 'A003', nombre: 'Carlos', apellido: 'Flores', dni: '72233445', categoria: 'Distrital' },
            { id: 'A004', nombre: 'Ana', apellido: 'Pérez', dni: '70122334', categoria: 'Nacional' },
            { id: 'A005', nombre: 'Jorge', apellido: 'Tapia', dni: '70344556', categoria: 'Departamental' },
            { id: 'A006', nombre: 'Diana', apellido: 'Huaman', dni: '71099887', categoria: 'Distrital' },
            { id: 'A007', nombre: 'Rogelio', apellido: 'Cruz', dni: '70911223', categoria: 'Nacional' },
            { id: 'A008', nombre: 'Elena', apellido: 'Lopez', dni: '70566778', categoria: 'Departamental' },
            { id: 'A009', nombre: 'Miguel', apellido: 'Santos', dni: '70788990', categoria: 'Distrital' },
            { id: 'A010', nombre: 'Patricia', apellido: 'Vargas', dni: '70877665', categoria: 'Nacional' },
        ]

        const t = setTimeout(() => {
            setArbitros(mock)
            setLoading(false)
        }, 300)

        return () => clearTimeout(t)
    }, [])

    return { arbitros, loading }
}
