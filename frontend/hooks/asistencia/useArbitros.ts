"use client"

import { useEffect, useState } from "react"
import { getArbitros, type Arbitro } from "@/services/api"

export function useArbitros() {
    const [arbitros, setArbitros] = useState<Arbitro[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchArbitros() {
            try {
                const data = await getArbitros()
                setArbitros(data)
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
