"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { useDataStore } from "@/lib/data-store"

export function CalendarioAsistencia() {
  const { asistencias, arbitros } = useDataStore()
  const [currentDate, setCurrentDate] = useState(new Date())

  // Obtener el primer día del mes y el último día
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()

  // Generar días del calendario
  const calendarDays = []

  // Días del mes anterior
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(firstDayOfMonth)
    date.setDate(date.getDate() - i - 1)
    calendarDays.push({ date, isCurrentMonth: false })
  }

  // Días del mes actual
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    calendarDays.push({ date, isCurrentMonth: true })
  }

  // Días del mes siguiente para completar la grilla
  const remainingDays = 42 - calendarDays.length
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(lastDayOfMonth)
    date.setDate(date.getDate() + day)
    calendarDays.push({ date, isCurrentMonth: false })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const getAsistenciasForDate = (date: Date) => {
    return asistencias.filter((a) => {
      const asistenciaDate = new Date(a.fecha)
      return asistenciaDate.toDateString() === date.toDateString()
    })
  }

  const isDayWithActivity = (date: Date) => {
    const dayOfWeek = date.getDay()
    return [1, 2, 4, 5].includes(dayOfWeek) // Lunes, Martes, Jueves, Viernes
  }

  const getActivityType = (date: Date) => {
    const dayOfWeek = date.getDay()
    if ([1, 2, 4].includes(dayOfWeek)) return "Preparación Física"
    if (dayOfWeek === 5) return "Entrenamiento"
    return null
  }

  return (
    <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendario de Asistencia
            </CardTitle>
            <CardDescription className="text-gray-600">Vista mensual de la asistencia de árbitros</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-lg font-semibold min-w-[200px] text-center">
              {currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
            </div>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((calendarDay, index) => {
            const asistenciasDelDia = getAsistenciasForDate(calendarDay.date)
            const hasActivity = isDayWithActivity(calendarDay.date)
            const activityType = getActivityType(calendarDay.date)
            const isToday = calendarDay.date.toDateString() === new Date().toDateString()

            return (
              <div
                key={index}
                className={`min-h-[80px] p-2 border rounded-lg transition-colors ${
                  calendarDay.isCurrentMonth
                    ? isToday
                      ? "bg-blue-50 border-blue-200"
                      : hasActivity
                        ? "bg-white border-gray-200 hover:bg-gray-50"
                        : "bg-gray-50 border-gray-100"
                    : "bg-gray-50 border-gray-100 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm ${
                      calendarDay.isCurrentMonth
                        ? isToday
                          ? "font-bold text-blue-700"
                          : "text-gray-700"
                        : "text-gray-400"
                    }`}
                  >
                    {calendarDay.date.getDate()}
                  </span>
                  {hasActivity && calendarDay.isCurrentMonth && (
                    <div
                      className={`w-2 h-2 rounded-full ${
                        [1, 2, 4].includes(calendarDay.date.getDay()) ? "bg-blue-400" : "bg-green-400"
                      }`}
                    />
                  )}
                </div>

                {hasActivity && calendarDay.isCurrentMonth && (
                  <div className="space-y-1">
                    <Badge
                      variant="outline"
                      className={`text-xs px-1 py-0 ${
                        [1, 2, 4].includes(calendarDay.date.getDay())
                          ? "bg-blue-50 text-blue-600 border-blue-200"
                          : "bg-green-50 text-green-600 border-green-200"
                      }`}
                    >
                      {activityType === "Preparación Física" ? "Prep." : "Entr."}
                    </Badge>

                    {asistenciasDelDia.length > 0 && (
                      <div className="text-xs text-gray-600">
                        {asistenciasDelDia.length} asistente{asistenciasDelDia.length !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span>Preparación Física (L, M, J)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span>Entrenamiento (V)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
