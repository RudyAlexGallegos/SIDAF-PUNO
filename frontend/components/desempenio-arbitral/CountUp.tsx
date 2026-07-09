"use client"

import { useEffect, useState } from "react"
import { animate, useMotionValue } from "framer-motion"

interface CountUpProps {
  to: number
  decimals?: number
  duration?: number
  suffix?: string
  prefix?: string
}

export function CountUp({ to, decimals = 0, duration = 1.6, suffix = "", prefix = "" }: CountUpProps) {
  const value = useMotionValue(0)
  const [display, setDisplay] = useState("0")

  useEffect(() => {
    const controls = animate(value, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    })
    return () => controls.stop()
  }, [to, decimals, duration, value])

  return (
    <span>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}
