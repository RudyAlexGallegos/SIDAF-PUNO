"use client"

import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  {
    name: "FIFA",
    altaDificultad: 25,
    mediaDificultad: 15,
    bajaDificultad: 5,
  },
  {
    name: "Nacional",
    altaDificultad: 10,
    mediaDificultad: 30,
    bajaDificultad: 15,
  },
  {
    name: "Regional",
    altaDificultad: 5,
    mediaDificultad: 20,
    bajaDificultad: 25,
  },
  {
    name: "Provincial",
    altaDificultad: 2,
    mediaDificultad: 10,
    bajaDificultad: 35,
  },
]

export function DashboardStats() {
  return (
    <ChartContainer
      config={{
        altaDificultad: {
          label: "Alta Dificultad",
          color: "hsl(var(--chart-1))",
        },
        mediaDificultad: {
          label: "Media Dificultad",
          color: "hsl(var(--chart-2))",
        },
        bajaDificultad: {
          label: "Baja Dificultad",
          color: "hsl(var(--chart-3))",
        },
      }}
      className="h-[300px]"
    >
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend />
        <Bar dataKey="altaDificultad" fill="var(--color-altaDificultad)" />
        <Bar dataKey="mediaDificultad" fill="var(--color-mediaDificultad)" />
        <Bar dataKey="bajaDificultad" fill="var(--color-bajaDificultad)" />
      </BarChart>
    </ChartContainer>
  )
}
