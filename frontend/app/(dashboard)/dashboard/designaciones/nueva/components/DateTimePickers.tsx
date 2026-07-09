"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import {
  format,
  startOfDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isBefore,
  addMonths,
} from "date-fns"
import { es } from "date-fns/locale"

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"]
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

const pad = (n: number) => n.toString().padStart(2, "0")

function toDate(value?: string): Date | undefined {
  if (!value) return undefined
  const d = new Date(`${value}T00:00:00`)
  return isNaN(d.getTime()) ? undefined : d
}

function formatLargo(fecha: Date): string {
  const s = format(fecha, "EEEE d 'de' MMMM yyyy", { locale: es })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  invalid?: boolean
  minDate?: Date
  id?: string
}

export function DatePicker({
  value,
  onChange,
  disabled,
  invalid,
  minDate,
  id,
}: DatePickerProps) {
  const seleccionada = toDate(value)
  const [open, setOpen] = React.useState(false)
  const [mesVista, setMesVista] = React.useState<Date>(seleccionada ?? minDate ?? new Date())

  React.useEffect(() => {
    if (seleccionada) setMesVista(seleccionada)
  }, [value])

  const inicioMes = startOfMonth(mesVista)
  const finMes = endOfMonth(mesVista)
  const dias = eachDayOfInterval({ start: inicioMes, end: finMes })
  const espaciosInicio = (getDay(inicioMes) + 6) % 7
  const hoy = startOfDay(new Date())
  const minDia = minDate ? startOfDay(minDate) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={`flex w-full h-10 items-center gap-2 px-3 rounded-md border text-sm transition-colors
            ${invalid
              ? "border-red-400 bg-red-50 text-red-700 ring-2 ring-red-100"
              : "border-gray-300 bg-white text-slate-900 hover:border-blue-400"}
            focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <CalendarIcon className={`w-4 h-4 ${invalid ? "text-red-500" : "text-blue-600"}`} />
          <span className={`flex-1 text-left ${seleccionada ? "font-medium" : "text-slate-400"}`}>
            {seleccionada ? formatLargo(seleccionada) : "Selecciona una fecha"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => setMesVista((m) => addMonths(m, -1))}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-sm font-semibold text-slate-800">
            {MESES[mesVista.getMonth()]} {mesVista.getFullYear()}
          </div>
          <button
            type="button"
            onClick={() => setMesVista((m) => addMonths(m, 1))}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((w) => (
            <div key={w} className="h-8 flex items-center justify-center text-xs font-medium text-slate-400">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: espaciosInicio }).map((_, i) => (
            <div key={`b${i}`} />
          ))}
          {dias.map((dia) => {
            const esSeleccionado = seleccionada ? isSameDay(dia, seleccionada) : false
            const esHoy = isSameDay(dia, hoy)
            const deshabilitado = minDia ? isBefore(startOfDay(dia), minDia) : false
            return (
              <button
                key={dia.toISOString()}
                type="button"
                disabled={deshabilitado}
                onClick={() => {
                  onChange(format(dia, "yyyy-MM-dd"))
                  setOpen(false)
                }}
                className={`h-9 w-9 rounded-full text-sm flex items-center justify-center transition-colors
                  ${esSeleccionado ? "bg-blue-600 text-white font-semibold" : ""}
                  ${!esSeleccionado && esHoy ? "bg-blue-50 text-blue-700 font-semibold" : ""}
                  ${!esSeleccionado && !esHoy ? "text-slate-700 hover:bg-slate-100" : ""}
                  ${deshabilitado
                    ? "text-slate-300 line-through cursor-not-allowed hover:bg-transparent"
                    : "cursor-pointer"}`}
              >
                {dia.getDate()}
              </button>
            )
          })}
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onChange(format(hoy, "yyyy-MM-dd"))
              setOpen(false)
            }}
            className="text-xs text-blue-600 hover:underline"
          >
            Hoy
          </button>
          {seleccionada && (
            <span className="text-xs text-slate-500">
              {format(seleccionada, "EEE d MMM", { locale: es })}
            </span>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface TimePickerProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  invalid?: boolean
  id?: string
}

const PRESETS = ["08:00", "12:00", "15:00", "18:00", "20:30"]

export function TimePicker({ value, onChange, disabled, invalid, id }: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [h, m] = value ? value.split(":").map(Number) : [null, null]
  const horaRef = React.useRef<HTMLDivElement>(null)
  const minRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    if (h != null && horaRef.current) {
      horaRef.current.scrollTop = h * 32 - horaRef.current.clientHeight / 2 + 16
    }
    if (m != null && minRef.current) {
      minRef.current.scrollTop = m * 32 - minRef.current.clientHeight / 2 + 16
    }
  }, [open, h, m])

  const setHora = (hh: number, mm: number) => onChange(`${pad(hh)}:${pad(mm)}`)

  const columnas = [
    { label: "Hora", ref: horaRef, items: Array.from({ length: 24 }, (_, i) => i), sel: h, onPick: (v: number) => setHora(v, m ?? 0) },
    { label: "Minuto", ref: minRef, items: Array.from({ length: 60 }, (_, i) => i), sel: m, onPick: (v: number) => setHora(h ?? 0, v) },
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={`flex w-full h-10 items-center gap-2 px-3 rounded-md border text-sm transition-colors
            ${invalid
              ? "border-red-400 bg-red-50 text-red-700 ring-2 ring-red-100"
              : "border-gray-300 bg-white text-slate-900 hover:border-blue-400"}
            focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Clock className={`w-4 h-4 ${invalid ? "text-red-500" : "text-blue-600"}`} />
          <span className={`flex-1 text-left ${value ? "font-medium" : "text-slate-400"}`}>
            {value ? value : "Selecciona una hora"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex gap-3">
          {columnas.map((col) => (
            <div key={col.label} className="flex flex-col">
              <div className="text-center text-xs font-semibold text-slate-400 mb-1">{col.label}</div>
              <div
                ref={col.ref}
                className="h-40 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 w-16"
              >
                {col.items.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => col.onPick(n)}
                    className={`w-full h-8 text-sm flex items-center justify-center rounded transition-colors
                      ${col.sel === n
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-slate-700 hover:bg-blue-100"}`}
                  >
                    {pad(n)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400 mb-1">Horarios rápidos</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  onChange(p)
                  setOpen(false)
                }}
                className="px-2 py-1 text-xs rounded-md border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
