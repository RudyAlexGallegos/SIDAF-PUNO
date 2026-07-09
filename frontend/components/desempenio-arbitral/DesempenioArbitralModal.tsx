"use client"

import { useEffect } from "react"
import { AnimatePresence, motion, Variants } from "framer-motion"
import { Activity, X, Footprints, Gauge, Flag, Ban, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Smartwatch } from "./Smartwatch"
import { FloatingParticles } from "./FloatingParticles"
import { MetricCard, itemVariants } from "./MetricCard"
import { CountUp } from "./CountUp"

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } },
}

const highlight = "font-semibold text-blue-600"

export function DesempenioArbitralModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="desempenio-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop con oscurecimiento y blur */}
          <motion.div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/60 bg-white/80 shadow-2xl backdrop-blur-xl md:grid-cols-2"
            initial={{ opacity: 0, scale: 0.94, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Cerrar */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-slate-500 shadow-sm backdrop-blur transition-colors hover:bg-blue-600 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* ===== Columna izquierda: visuales ===== */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-blue-600/90 to-indigo-700/90 p-6 md:rounded-l-3xl md:rounded-tr-none"
            >
              <FloatingParticles />

              <motion.div variants={itemVariants} className="relative mb-2 flex items-center gap-2 text-white/90">
                <Activity className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">Monitoreo en vivo</span>
              </motion.div>

              <div className="relative flex justify-center py-4">
                <Smartwatch />
              </div>

              <div className="relative grid grid-cols-2 gap-3">
                <MetricCard
                  icon={Footprints}
                  label="Distancia"
                  value={<CountUp to={9.42} decimals={2} suffix=" km" />}
                  accent="text-sky-600"
                  glow="bg-sky-500/15"
                  className="bg-white/80"
                />
                <MetricCard
                  icon={Gauge}
                  label="Velocidad"
                  value={<CountUp to={8.6} decimals={1} suffix=" km/h" />}
                  accent="text-amber-600"
                  glow="bg-amber-500/15"
                  className="bg-white/80"
                />
                <MetricCard
                  icon={Flag}
                  label="Tarjetas Amarillas"
                  value={<CountUp to={2} />}
                  accent="text-yellow-600"
                  glow="bg-yellow-400/20"
                  className="bg-white/80"
                />
                <MetricCard
                  icon={Ban}
                  label="Tarjetas Rojas"
                  value={<CountUp to={1} />}
                  accent="text-red-600"
                  glow="bg-red-500/15"
                  className="bg-white/80"
                />
              </div>
            </motion.div>

            {/* ===== Columna derecha: información ===== */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-4 p-6 md:p-8"
            >
              <motion.div variants={itemVariants}>
                <Badge className="bg-blue-600 text-white">Próximamente</Badge>
              </motion.div>

              <motion.h2
                variants={itemVariants}
                className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl"
              >
                Desempeño Arbitral
              </motion.h2>

              <motion.p variants={itemVariants} className="text-sm leading-relaxed text-slate-600">
                Próximamente, los árbitros contarán con relojes inteligentes que registrarán en tiempo
                real su <span className={highlight}>desplazamiento</span>, <span className={highlight}>velocidad</span>,{" "}
                <span className={highlight}>amonestaciones</span> y <span className={highlight}>expulsiones</span> durante cada
                partido, permitiendo analizar su rendimiento físico y técnico de forma objetiva.
              </motion.p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <MetricCard
                  icon={Footprints}
                  label="Desplazamiento"
                  description="Kilómetros recorridos por el árbitro."
                />
                <MetricCard
                  icon={Gauge}
                  label="Velocidad"
                  description="Velocidad alcanzada en el encuentro."
                />
                <MetricCard
                  icon={Flag}
                  label="Amonestaciones"
                  description="Tarjetas amarillas mostradas."
                />
                <MetricCard
                  icon={Ban}
                  label="Expulsiones"
                  description="Tarjetas rojas mostradas."
                />
              </div>

              <motion.div
                variants={itemVariants}
                className="mt-1 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4"
              >
                <motion.span
                  animate={{ y: [0, -4, 0], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white"
                >
                  <Sparkles className="h-4 w-4" />
                </motion.span>
                <p className="text-xs leading-relaxed text-slate-600">
                  Trabajamos para brindarte herramientas que impulsen la mejora continua del arbitraje.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-1">
                <Button
                  onClick={onClose}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  Entendido
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
