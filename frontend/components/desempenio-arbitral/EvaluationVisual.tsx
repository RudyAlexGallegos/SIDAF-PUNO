"use client"

import { motion } from "framer-motion"

export function EvaluationVisual() {
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
        aria-label="Evaluación de árbitro"
      >
        {/* Tablero de portapapeles */}
        <rect x="36" y="34" width="100" height="144" rx="16" fill="#0f172a" stroke="#3b82f6" strokeWidth="2.5" />
        <rect x="64" y="22" width="44" height="20" rx="8" fill="#1e293b" />
        <rect x="74" y="16" width="24" height="12" rx="6" fill="#3b82f6" />

        {/* Anillo de calificación */}
        <circle cx="86" cy="74" r="26" stroke="#1e293b" strokeWidth="6" fill="none" />
        <motion.circle
          cx="86"
          cy="74"
          r="26"
          stroke="#22c55e"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="163"
          strokeDashoffset="163"
          transform="rotate(-90 86 74)"
          animate={{ strokeDashoffset: [163, 26, 163] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <text x="86" y="79" textAnchor="middle" fill="#e2e8f0" fontSize="15" fontWeight="700">
          8.4
        </text>
        <text x="86" y="92" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="600">
          / 10
        </text>

        {/* Lista de verificación animada */}
        {[
          { y: 122, d: "M70 122 l5 5 l9 -11" },
          { y: 142, d: "M70 142 l5 5 l9 -11" },
          { y: 162, d: "M70 162 l5 5 l9 -11" },
        ].map((row, i) => (
          <g key={i}>
            <rect x="64" y={row.y - 9} width="44" height="6" rx="3" fill="#1e293b" />
            <motion.path
              d={row.d}
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: i * 0.4 }}
            />
          </g>
        ))}

        <rect x="56" y="40" width="40" height="10" rx="5" fill="#ffffff" opacity="0.06" />
      </svg>
    </motion.div>
  )
}
