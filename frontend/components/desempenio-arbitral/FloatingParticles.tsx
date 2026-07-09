"use client"

import { motion } from "framer-motion"

const PARTICLES = [
  { cls: "top-[10%] left-[16%] w-1.5 h-1.5", delay: 0, dur: 5 },
  { cls: "top-[72%] left-[10%] w-1 h-1", delay: 1.2, dur: 6 },
  { cls: "top-[26%] left-[82%] w-2 h-2", delay: 0.6, dur: 7 },
  { cls: "top-[84%] left-[74%] w-1.5 h-1.5", delay: 1.8, dur: 5.5 },
  { cls: "top-[48%] left-[90%] w-1 h-1", delay: 2.4, dur: 6.5 },
  { cls: "top-[18%] left-[52%] w-1 h-1", delay: 0.9, dur: 6 },
  { cls: "top-[64%] left-[60%] w-1.5 h-1.5", delay: 1.5, dur: 7.5 },
]

export function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className={cnParticle(p.cls)}
          animate={{ y: [0, -18, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        />
      ))}
    </div>
  )
}

function cnParticle(cls: string) {
  return `absolute rounded-full bg-blue-400/70 blur-[1px] ${cls}`
}
