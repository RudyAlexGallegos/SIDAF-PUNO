"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import { getArbitros, updateArbitro, Arbitro } from "@/services/api"

// ==================== TIPOS ====================
type EstadoArbitro = "activo" | "inactivo" | "suspendido" | "licencia_medica"
type Categoria = "FIFA" | "Nacional" | "Primera Categoría" | "Segunda Categoría" | "Tercera Categoría" | "Aspirante"
type Sexo = "masculino" | "femenino"

interface ArbitroData {
  apellidoPaterno: string
  apellidoMaterno: string
  nombres: string
  fechaNacimiento: string
  lugarNacimiento: string
  dni: string
  sexo: Sexo | ""
  estatura: string
  foto: string
  distrito: string
  provincia: string
  direccion: string
  telefono: string
  telefonoEmergencia: string
  email: string
  categoria: Categoria
  fechaAfiliacion: string
  fechaExamenTeorico: string
  fechaExamenPractico: string
  academiaFormadora: string
  experiencia: string
  nivelPreparacion: string
  roles: string[]
  especialidades: string[]
  estado: EstadoArbitro
  observaciones: string
  declaracionJurada: boolean
}

// ==================== DATOS PUNO ====================
const PROVINCIA_DISTRITOS: Record<string, string[]> = {
  Puno: ["Puno", "Ácora", "Atuncolla", "Mañazo", "Tirapata", "Paucarcolla", "San Antonio de Esquilache", "Maure", "Taquile"],
  "San Román": ["Juliaca", "Azángaro", "Samicaya", "Cuyuchí", "Huancané", "Cojata", "Huatasani", "Cuturapi", "Otoca", "Tilali"],
  "El Collao": ["Ilave", "Capazo", "Pilcuyo", "Santa Rosa", "Mañazo", "Conduriri"],
  Chucuito: ["Juli", "Desaguadero", "Zepita", "Balvina", "Comina", "Kelluyo", "Maure", "Pisacoma", "Pomata", "Tinicachi"],
  Huancané: ["Huancané", "Taraco", "Vilque Chico", "Cahocache", "Pisacoma", "Huatasani", "Rosaspata", "San Antonio de Cusi", "Tinquiconi"],
  Lampa: ["Lampa", "Cabanilla", "Calapuja", "Núñoa", "Palca", "Pucará", "Santa Lucía", "Ocuviri", "Picuta", "Progreso"],
  Melgar: ["Ayaviri", "Antauta", "Cupi", "Llalli", "Macari", "Nuñoa", "Ocuviri", "Pucará", "Santa Rosa", "Umachiri"],
  Moho: ["Moho", "Conima", "Huayrapata", "Tilali"],
  "San Antonio de Putina": ["Putina", "Ananea", "Pedro Vilca Apaza", "Quilcapuncu", "Sina"],
  Sandia: ["Sandia", "Cuyuchí", "Bala", "Limbani", "Patambuco", "Phara", "Quilcapuncu", "Sibayo", "Tiniguad"],
  Yunguyo: ["Yunguyo", "Anapia", "Camacachi", "Chupa", "Manu", "Ollachea", "Tapacari", "Tiquillaca", "Unicachi"]
}

const PROVINCIAS_PUNO = Object.keys(PROVINCIA_DISTRITOS)

const getDistritosPorProvincia = (provincia: string): string[] => {
  return PROVINCIA_DISTRITOS[provincia] || []
}

const CATEGORIAS_CODAR = [
  { value: "FIFA", label: "FIFA", desc: "Árbitros FIFA" },
  { value: "Nacional", label: "Categoría Nacional", desc: "Árbitros de categoría nacional" },
  { value: "Primera Categoría", label: "Primera Categoría", desc: "Árbitros de primera categoría" },
  { value: "Segunda Categoría", label: "Segunda Categoría", desc: "Árbitros de segunda categoría" },
  { value: "Tercera Categoría", label: "Tercera Categoría", desc: "Árbitros en formación avanzada" },
  { value: "Aspirante", label: "Aspirante", desc: "Reciente incorporación" }
]

const ROLES_CODAR = [
  { id: "arbitro_principal", label: "Árbitro Principal" },
  { id: "asistente", label: "Asistente" },
  { id: "cuarto_oficial", label: "Cuarto Oficial" },
  { id: "var", label: "VAR" },
  { id: "avar", label: "AVAR" }
]

const ESPECIALIDADES = [
  { id: "futbol", label: "Fútbol" },
  { id: "futsal", label: "Futsal" }
]

// ==================== FUNCIONES UTILITARIAS ====================
const calcularEdad = (fechaNacimiento: string): number => {
  if (!fechaNacimiento) return 0
  const nacimiento = new Date(fechaNacimiento)
  const hoy = new Date()
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--
  }
  return edad
}

const calcularAniosComoArbitro = (fechaAfiliacion: string): number => {
  if (!fechaAfiliacion) return 0
  const afiliacion = new Date(fechaAfiliacion)
  const hoy = new Date()
  let anios = hoy.getFullYear() - afiliacion.getFullYear()
  const mes = hoy.getMonth() - afiliacion.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < afiliacion.getDate())) {
    anios--
  }
  return anios
}

// ==================== COMPONENTES UI ====================
const InputField = ({
  label,
  required,
  error,
  children
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
)

const CustomInput = ({
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
  disabled = false,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    disabled={disabled}
    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
    {...props}
  />
)

const CustomSelect = ({
  value,
  onChange,
  children,
  required = false,
  className = "",
  disabled = false,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
  <select
    value={value}
    onChange={onChange}
    required={required}
    disabled={disabled}
    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
    {...props}
  >
    {children}
  </select>
)

const CustomTextarea = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  className = "",
  disabled = false,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    disabled={disabled}
    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
    {...props}
  />
)

const CheckboxOption = ({
  id,
  label,
  checked,
  onChange,
  description,
  disabled = false
}: {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
  disabled?: boolean
}) => (
  <div className={`flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
    />
    <div className="flex-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-900 cursor-pointer">
        {label}
      </label>
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
    </div>
  </div>
)

const RadioOption = ({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: () => void
  disabled?: boolean
}) => (
  <div
    className={`p-4 border rounded-lg cursor-pointer transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${
      checked
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-gray-300'
    }`}
    onClick={() => !disabled && onChange()}
  >
    <div className="flex items-start">
      <input
        type="radio"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="mt-1 h-4 w-4 text-blue-600"
      />
      <div className="ml-3 flex-1">
        <label htmlFor={id} className="block text-sm font-medium text-gray-900 cursor-pointer">
          {label}
        </label>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  </div>
)

const Button = ({
  children,
  type = "button",
  onClick,
  disabled = false,
  variant = "primary",
  className = ""
}: {
  children: React.ReactNode
  type?: "button" | "submit" | "reset"
  onClick?: () => void
  disabled?: boolean
  variant?: "primary" | "secondary" | "outline"
  className?: string
}) => {
  const baseClasses = "px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 focus:ring-blue-500",
    secondary: "bg-gradient-to-r from-gray-600 to-gray-800 text-white hover:from-gray-700 hover:to-gray-900 focus:ring-gray-500",
    outline: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500"
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

const SectionCard = ({
  title,
  description,
  children
}: {
  title: string
  description: string
  children: React.ReactNode
}) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
    <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>
        </div>
      </div>
    </div>
    <div className="p-8">
      {children}
    </div>
  </div>
)

// ==================== COMPONENTE PRINCIPAL ====================
export default function EditarArbitroPage() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode")
  const soloLectura = mode === "view"

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [edad, setEdad] = useState<number>(0)
  const [aniosComoArbitro, setAniosComoArbitro] = useState<number>(0)

  const [form, setForm] = useState<ArbitroData>({
    apellidoPaterno: "",
    apellidoMaterno: "",
    nombres: "",
    fechaNacimiento: "",
    lugarNacimiento: "",
    dni: "",
    sexo: "",
    estatura: "",
    foto: "",
    distrito: "",
    provincia: "",
    direccion: "",
    telefono: "",
    telefonoEmergencia: "",
    email: "",
    categoria: "Tercera Categoría",
    fechaAfiliacion: "",
    fechaExamenTeorico: "",
    fechaExamenPractico: "",
    academiaFormadora: "",
    experiencia: "",
    nivelPreparacion: "",
    roles: [],
    especialidades: [],
    estado: "activo",
    observaciones: "",
    declaracionJurada: true
  })

  // Cargar datos del árbitro
  useEffect(() => {
    async function cargar() {
      setLoading(true)
      try {
        const lista = await getArbitros()
        const encontrado = lista.find((a: Arbitro) => a.id === Number(id))
        
        if (!encontrado) {
          router.push("/dashboard/arbitros")
          return
        }

        const arb = encontrado as any

        // Parsear nombre completo
        const nombreCompleto = encontrado.apellido || ""
        const nombresPartes = nombreCompleto.split(" ")
        let apellidoPaterno = ""
        let apellidoMaterno = ""
        
        if (nombresPartes.length >= 2) {
          apellidoPaterno = nombresPartes[0]
          apellidoMaterno = nombresPartes.slice(1).join(" ")
        } else {
          apellidoPaterno = nombreCompleto
        }

        // Parsear roles
        let rolesArray: string[] = []
        try {
          if (arb.roles) rolesArray = JSON.parse(arb.roles)
        } catch { rolesArray = [] }

        // Parsear especialidades
        let especialidadesArray: string[] = []
        try {
          if (arb.especialidades) especialidadesArray = JSON.parse(arb.especialidades)
        } catch { especialidadesArray = [] }

        setForm({
          apellidoPaterno,
          apellidoMaterno,
          nombres: arb.nombre || "",
          fechaNacimiento: arb.fechaNacimiento || "",
          lugarNacimiento: arb.lugarNacimiento || "",
          dni: arb.dni || "",
          sexo: arb.sexo || "",
          estatura: arb.estatura || "",
          foto: arb.foto || "",
          distrito: arb.distrito || "",
          provincia: arb.provincia || "",
          direccion: arb.direccion || "",
          telefono: arb.telefono || "",
          telefonoEmergencia: arb.telefonoEmergencia || "",
          email: arb.email || "",
          categoria: arb.categoria || "Tercera Categoría",
          fechaAfiliacion: arb.fechaAfiliacion || "",
          fechaExamenTeorico: arb.fechaExamenTeorico || "",
          fechaExamenPractico: arb.fechaExamenPractico || "",
          academiaFormadora: arb.academiaFormadora || "",
          experiencia: arb.experiencia?.toString() || "",
          nivelPreparacion: arb.nivelPreparacion || "",
          roles: rolesArray,
          especialidades: especialidadesArray,
          estado: arb.estado || "activo",
          observaciones: arb.observaciones || "",
          declaracionJurada: true
        })

        if (arb.fechaNacimiento) {
          setEdad(calcularEdad(arb.fechaNacimiento))
        }

        if (arb.fechaAfiliacion) {
          setAniosComoArbitro(calcularAniosComoArbitro(arb.fechaAfiliacion))
        }

      } catch (error) {
        console.error("Error cargando árbitro:", error)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [id, router])

  // Actualizar formulario
  const updateForm = useCallback((updates: Partial<ArbitroData>) => {
    setForm(prev => ({ ...prev, ...updates }))
    const fieldName = Object.keys(updates)[0]
    if (fieldName && errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }, [errors])

  // Guardar cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setSaving(true)
    
    try {
      const arbitroData = {
        nombre: form.nombres,
        apellido: form.apellidoPaterno ? 
          (form.apellidoMaterno ? `${form.apellidoPaterno} ${form.apellidoMaterno}` : form.apellidoPaterno) : 
          (form.apellidoMaterno || ""),
        fechaNacimiento: form.fechaNacimiento ? new Date(form.fechaNacimiento).toISOString().split('T')[0] : undefined,
        lugarNacimiento: form.lugarNacimiento,
        dni: form.dni,
        sexo: form.sexo,
        estatura: form.estatura,
        foto: form.foto,
        distrito: form.distrito,
        provincia: form.provincia,
        direccion: form.direccion,
        telefono: form.telefono,
        telefonoEmergencia: form.telefonoEmergencia,
        email: form.email,
        categoria: form.categoria,
        fechaAfiliacion: form.fechaAfiliacion ? new Date(form.fechaAfiliacion).toISOString().split('T')[0] : undefined,
        fechaExamenTeorico: form.fechaExamenTeorico ? new Date(form.fechaExamenTeorico).toISOString().split('T')[0] : undefined,
        fechaExamenPractico: form.fechaExamenPractico ? new Date(form.fechaExamenPractico).toISOString().split('T')[0] : undefined,
        academiaFormadora: form.academiaFormadora,
        experiencia: form.experiencia ? parseInt(form.experiencia) : undefined,
        nivelPreparacion: form.nivelPreparacion,
        roles: JSON.stringify(form.roles),
        especialidades: JSON.stringify(form.especialidades),
        estado: form.estado,
        observaciones: form.observaciones,
        declaracionJurada: form.declaracionJurada,
        disponible: form.estado === 'activo',
        fechaRegistro: new Date().toISOString().split('T')[0],
      }

      await updateArbitro(Number(id), arbitroData as any)
      alert("Se ha actualizado exitosamente el árbitro")
      router.push(`/dashboard/arbitros/${id}`)
      
    } catch (error) {
      console.error("Error:", error)
      alert("Error al actualizar. Por favor, intente nuevamente.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-gray-600">Cargando datos del árbitro...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* HEADER CORPORATIVO */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="h-auto py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3 order-2 sm:order-1">
              <Link
                href={`/dashboard/arbitros/${id}`}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">
                  <span className="text-lg">←</span>
                </div>
                <span className="font-medium hidden sm:inline">Volver</span>
              </Link>
            </div>

            <div className="text-center order-1 sm:order-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Editar Árbitro</h1>
              <p className="text-xs sm:text-sm text-gray-600">Comisión Departamental de Árbitros • Puno</p>
            </div>

            <div className="order-3"></div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit}>
          {/* SECCIÓN 1: IDENTIFICACIÓN */}
          <div className="mb-8">
            <SectionCard
              title="Identificación del Árbitro"
              description="Información personal básica del árbitro"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField label="Apellido Paterno" required error={errors.apellidoPaterno}>
                    <CustomInput
                      value={form.apellidoPaterno}
                      onChange={(e) => updateForm({ apellidoPaterno: e.target.value })}
                      placeholder="Ingrese apellido paterno"
                      disabled={soloLectura}
                    />
                  </InputField>

                  <InputField label="Apellido Materno">
                    <CustomInput
                      value={form.apellidoMaterno}
                      onChange={(e) => updateForm({ apellidoMaterno: e.target.value })}
                      placeholder="Ingrese apellido materno"
                      disabled={soloLectura}
                    />
                  </InputField>

                  <InputField label="Nombres Completos" required error={errors.nombres}>
                    <CustomInput
                      value={form.nombres}
                      onChange={(e) => updateForm({ nombres: e.target.value })}
                      placeholder="Ingrese nombres completos"
                      disabled={soloLectura}
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField label="DNI" required error={errors.dni}>
                    <CustomInput
                      value={form.dni}
                      onChange={(e) => updateForm({ dni: e.target.value })}
                      placeholder="Número de 8 dígitos"
                      pattern="[0-9]{8}"
                      disabled={soloLectura}
                    />
                  </InputField>

                  <InputField label="Fecha de Nacimiento">
                    <div className="space-y-2">
                      <CustomInput
                        type="date"
                        value={form.fechaNacimiento}
                        onChange={(e) => updateForm({ fechaNacimiento: e.target.value })}
                        max={new Date().toISOString().split('T')[0]}
                        disabled={soloLectura}
                      />
                      {form.fechaNacimiento && (
                        <div className="text-sm text-blue-600 font-medium">
                          Edad calculada: {calcularEdad(form.fechaNacimiento)} años
                        </div>
                      )}
                    </div>
                  </InputField>

                  <InputField label="Lugar de Nacimiento">
                    <CustomInput
                      value={form.lugarNacimiento}
                      onChange={(e) => updateForm({ lugarNacimiento: e.target.value })}
                      placeholder="Ciudad, Departamento"
                      disabled={soloLectura}
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Sexo" required error={errors.sexo}>
                    <CustomSelect
                      value={form.sexo}
                      onChange={(e) => updateForm({ sexo: e.target.value as Sexo })}
                      disabled={soloLectura}
                    >
                      <option value="">Seleccionar sexo</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                    </CustomSelect>
                  </InputField>

                  <InputField label="Estatura (cm)">
                    <CustomInput
                      value={form.estatura}
                      onChange={(e) => updateForm({ estatura: e.target.value })}
                      placeholder="Ej: 175"
                      type="number"
                      min="100"
                      max="250"
                      step="0.1"
                      disabled={soloLectura}
                    />
                  </InputField>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* SECCIÓN 2: CONTACTO */}
          <div className="mb-8">
            <SectionCard
              title="Contacto y Domicilio"
              description="Información de contacto y ubicación en el departamento"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField label="Provincia" required error={errors.provincia}>
                    <CustomSelect
                      value={form.provincia}
                      onChange={(e) => updateForm({ provincia: e.target.value, distrito: "" })}
                      disabled={soloLectura}
                    >
                      <option value="">Seleccionar provincia</option>
                      {PROVINCIAS_PUNO.map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </CustomSelect>
                  </InputField>

                  <InputField label="Distrito" required error={errors.distrito}>
                    <CustomSelect
                      value={form.distrito}
                      onChange={(e) => updateForm({ distrito: e.target.value })}
                      disabled={!form.provincia || soloLectura}
                    >
                      <option value="">{form.provincia ? "Seleccionar distrito" : "Primero seleccione una provincia"}</option>
                      {getDistritosPorProvincia(form.provincia).map((dist: string) => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </CustomSelect>
                  </InputField>

                  <InputField label="Dirección" required error={errors.direccion}>
                    <CustomInput
                      value={form.direccion}
                      onChange={(e) => updateForm({ direccion: e.target.value })}
                      placeholder="Calle, número, referencia"
                      disabled={soloLectura}
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField label="Teléfono / WhatsApp" required error={errors.telefono}>
                    <CustomInput
                      value={form.telefono}
                      onChange={(e) => updateForm({ telefono: e.target.value })}
                      placeholder="Número de contacto"
                      disabled={soloLectura}
                    />
                  </InputField>

                  <InputField label="Teléfono de Emergencia">
                    <CustomInput
                      value={form.telefonoEmergencia}
                      onChange={(e) => updateForm({ telefonoEmergencia: e.target.value })}
                      placeholder="Contacto alternativo"
                      disabled={soloLectura}
                    />
                  </InputField>

                  <InputField label="Correo Electrónico" required error={errors.email}>
                    <CustomInput
                      type="email"
                      value={form.email}
                      onChange={(e) => updateForm({ email: e.target.value })}
                      placeholder="correo@codarpuno.com"
                      disabled={soloLectura}
                    />
                  </InputField>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* SECCIÓN 3: PROFESIONAL */}
          <div className="mb-8">
            <SectionCard
              title="Datos Profesionales"
              description="Información de categoría y certificaciones"
            >
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Categoría</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {CATEGORIAS_CODAR.map((cat) => (
                      <RadioOption
                        key={cat.value}
                        id={`cat-${cat.value}`}
                        label={cat.label}
                        description={cat.desc}
                        checked={form.categoria === cat.value}
                        onChange={() => !soloLectura && updateForm({ categoria: cat.value as Categoria })}
                        disabled={soloLectura}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField label="Fecha de Afiliación">
                    <div className="space-y-2">
                      <CustomInput
                        type="date"
                        value={form.fechaAfiliacion}
                        onChange={(e) => updateForm({ fechaAfiliacion: e.target.value })}
                        disabled={soloLectura}
                      />
                      {form.fechaAfiliacion && (
                        <div className="text-sm text-blue-600 font-medium">
                          Tiempo como árbitro: {calcularAniosComoArbitro(form.fechaAfiliacion)} años
                        </div>
                      )}
                    </div>
                  </InputField>

                  <InputField label="Examen Teórico">
                    <CustomInput
                      type="date"
                      value={form.fechaExamenTeorico}
                      onChange={(e) => updateForm({ fechaExamenTeorico: e.target.value })}
                      disabled={soloLectura}
                    />
                  </InputField>

                  <InputField label="Examen Práctico">
                    <CustomInput
                      type="date"
                      value={form.fechaExamenPractico}
                      onChange={(e) => updateForm({ fechaExamenPractico: e.target.value })}
                      disabled={soloLectura}
                    />
                  </InputField>
                </div>

                <InputField label="Escuela Formadora">
                  <CustomInput
                    value={form.academiaFormadora}
                    onChange={(e) => updateForm({ academiaFormadora: e.target.value })}
                    placeholder="Institución donde recibió formación"
                    disabled={soloLectura}
                  />
                </InputField>
              </div>
            </SectionCard>
          </div>

          {/* SECCIÓN 4: ROLES */}
          <div className="mb-8">
            <SectionCard
              title="Roles y Especialidades"
              description="Funciones arbitrales y modalidades deportivas"
            >
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Roles Arbitrales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {ROLES_CODAR.map((role) => (
                      <CheckboxOption
                        key={role.id}
                        id={`role-${role.id}`}
                        label={role.label}
                        checked={form.roles.includes(role.id)}
                        onChange={(checked) => {
                          if (soloLectura) return
                          updateForm({
                            roles: checked
                              ? [...form.roles, role.id]
                              : form.roles.filter(r => r !== role.id)
                          })
                        }}
                        disabled={soloLectura}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Especialidades</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ESPECIALIDADES.map((esp) => (
                      <CheckboxOption
                        key={esp.id}
                        id={`esp-${esp.id}`}
                        label={esp.label}
                        checked={form.especialidades.includes(esp.id)}
                        onChange={(checked) => {
                          if (soloLectura) return
                          updateForm({
                            especialidades: checked
                              ? [...form.especialidades, esp.id]
                              : form.especialidades.filter(e => e !== esp.id)
                          })
                        }}
                        disabled={soloLectura}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* SECCIÓN 5: ESTADO */}
          <div className="mb-8">
            <SectionCard
              title="Estado del Árbitros"
              description="Estado actual y observaciones administrativas"
            >
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Árbitro</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { value: "activo", label: "Activo", desc: "Habilitado para designaciones" },
                      { value: "inactivo", label: "Inactivo", desc: "No disponible temporalmente" },
                      { value: "suspendido", label: "Suspendido", desc: "Sanción disciplinaria" },
                      { value: "licencia_medica", label: "Licencia Médica", desc: "Incapacidad temporal" }
                    ].map((estado) => (
                      <RadioOption
                        key={estado.value}
                        id={`estado-${estado.value}`}
                        label={estado.label}
                        description={estado.desc}
                        checked={form.estado === estado.value}
                        onChange={() => !soloLectura && updateForm({ estado: estado.value as EstadoArbitro })}
                        disabled={soloLectura}
                      />
                    ))}
                  </div>
                </div>

                <InputField label="Observaciones Administrativas">
                  <CustomTextarea
                    value={form.observaciones}
                    onChange={(e) => updateForm({ observaciones: e.target.value })}
                    placeholder="Notas, comentarios o información adicional relevante"
                    rows={4}
                    disabled={soloLectura}
                  />
                </InputField>
              </div>
            </SectionCard>
          </div>

          {/* BOTONES */}
          {!soloLectura && (
            <div className="mt-8 flex justify-end gap-4">
              <Link
                href={`/dashboard/arbitros/${id}`}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </Link>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          )}
        </form>
      </main>
    </div>
  )
}
