"use client"

import { useEffect, useState } from "react"
import { getArbitros, type Arbitro } from "@/services/api"

const ORDEN_ARBITROS = [2,3,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,1,32,4]

export function useArbitros() {
    const [arbitros, setArbitros] = useState<Arbitro[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchArbitros() {
            try {
                const data = await getArbitros()
                const ordenados = [...data].sort((a, b) => {
                    const ordA = (a as any).orden ?? ORDEN_ARBITROS.indexOf(Number(a.id))
                    const ordB = (b as any).orden ?? ORDEN_ARBITROS.indexOf(Number(b.id))
                    if ((ordA == null || ordA === -1) && (ordB == null || ordB === -1)) return 0
                    if (ordA == null || ordA === -1) return 1
                    if (ordB == null || ordB === -1) return -1
                    return ordA - ordB
                })
                setArbitros(ordenados)
                setError(null)
            } catch (err: any) {
                console.error("❌ Error conectando al backend:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchArbitros()
    }, [])

    return { arbitros, loading, error }
}
