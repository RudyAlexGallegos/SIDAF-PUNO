"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"

const PageContent = dynamic(() => import("@/components/designaciones-page-v3"), {
  ssr: false,
})

export default function DesignacionesPage() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted ? <PageContent /> : <div className="p-8">Cargando...</div>
}
