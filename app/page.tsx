// app/page.tsx
"use client"

import { useEffect, useState } from "react"

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative text-center max-w-3xl mx-auto">
      {!showWelcome && (
        <div className="absolute top-[25%] left-0 right-0 animate-fadeOut delay-[2.5s]">
          <p className="text-[2.6rem] font-serif italic text-black leading-snug">
            “Un partido justo no es casualidad. Es el fruto de conocimiento compartido, paciencia y amor por el deporte.”
          </p>
        </div>
      )}

      {showWelcome && (
        <div className="animate-fadeIn text-slate-700 space-y-4 mt-20">
          <h2 className="text-blue-900 text-xl font-semibold">Bienvenido al Sistema SIDAF PUNO</h2>
          <p>Plataforma de gestión de árbitros, asistencias, designaciones y campeonatos.</p>
          <p className="font-medium">Utiliza el menú lateral para acceder a las funcionalidades del sistema:</p>
          <ul className="list-disc list-inside text-left mx-auto space-y-1 text-sm">
            <li>Registrar y consultar árbitros disponibles.</li>
            <li>Gestionar asistencias diarias.</li>
            <li>Designar árbitros a eventos deportivos.</li>
            <li>Controlar campeonatos y generar reportes.</li>
          </ul>
        </div>
      )}
    </div>
  )
}
