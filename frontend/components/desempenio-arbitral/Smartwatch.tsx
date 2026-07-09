"use client"

import { motion } from "framer-motion"

export function Smartwatch() {
  return (
    <motion.div
      className="relative mx-auto"
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        width="172"
        height="212"
        viewBox="0 0 172 212"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Smartwatch del árbitro"
      >
        {/* Correas */}
        <rect x="58" y="4" width="56" height="46" rx="16" fill="#1e293b" />
        <rect x="58" y="162" width="56" height="46" rx="16" fill="#1e293b" />

        {/* Cuerpo */}
        <rect x="38" y="42" width="96" height="128" rx="28" fill="#0f172a" stroke="#3b82f6" strokeWidth="2.5" />
        {/* Pantalla */}
        <rect x="50" y="54" width="72" height="104" rx="20" fill="#0b1220" />

        {/* Ruta GPS animada */}
        <motion.path
          d="M64 138 C 70 104, 98 108, 102 86 C 106 70, 86 64, 94 50"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        {/* Punto pulsante (destino) */}
        <motion.circle
          cx="94"
          cy="50"
          r="4"
          fill="#38bdf8"
          animate={{ scale: [1, 1.7, 1], opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Anillo de métrica (ritmo) */}
        <circle cx="86" cy="104" r="17" stroke="#1e293b" strokeWidth="4" fill="none" />
        <motion.circle
          cx="86"
          cy="104"
          r="17"
          stroke="#22c55e"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="106"
          strokeDashoffset="30"
          transform="rotate(-90 86 104)"
          animate={{ strokeDashoffset: [30, 12, 30] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <text x="86" y="108" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="700">
          86
        </text>

        {/* Brillo superior */}
        <rect x="58" y="60" width="40" height="10" rx="5" fill="#ffffff" opacity="0.06" />
      </svg>
    </motion.div>
  )
}
