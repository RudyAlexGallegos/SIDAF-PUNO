"use client"

import { motion, Variants } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value?: ReactNode
  description?: string
  accent?: string
  glow?: string
  className?: string
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  description,
  accent = "text-blue-600",
  glow = "bg-blue-500/10",
  className,
}: MetricCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-md transition-shadow hover:shadow-xl",
        className,
      )}
    >
      <div
        className={cn(
          "absolute -inset-px rounded-2xl bg-blue-400/0 opacity-0 blur-xl transition-opacity duration-300 group-hover:bg-blue-400/30 group-hover:opacity-100",
          glow,
        )}
      />
      <div className="relative flex items-start gap-3">
        <div className={cn("shrink-0 rounded-xl p-2", glow, accent)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          {value ? <p className="text-lg font-bold leading-tight text-slate-900">{value}</p> : null}
          {description ? (
            <p className="mt-0.5 text-xs leading-snug text-slate-500">{description}</p>
          ) : null}
          <span className="mt-2 block h-0.5 w-8 origin-left scale-x-0 rounded-full bg-blue-500 transition-transform duration-300 group-hover:scale-x-100" />
        </div>
      </div>
    </motion.div>
  )
}
