"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// ==================== TIPOS ====================
type EstadoArbitro = "activo" | "inactivo" | "suspendido" | "licencia_medica"
type Categoria = "FIFA" | "Nacional" | "Primera Categoría" | "Segunda Categoría" | "Tercera Categoría" | "Aspirante"
type Sexo = "masculino" | "femenino"

interface ArbitroData {
  // Sección 1: Identificación
  apellidoPaterno: string
  apellidoMaterno: string
  nombres: string
  fechaNacimiento: string
  lugarNacimiento: string
  dni: string
  sexo: Sexo | ""
  estatura: string
  foto: string // URL de la foto o avatar

  // Sección 2: Contacto y Domicilio
  distrito: string
  provincia: string
  direccion: string
  telefono: string
  telefonoEmergencia: string
  email: string

  // Sección 3: Datos Profesionales
  categoria: Categoria
  fechaAfiliacion: string
  fechaExamenTeorico: string
  fechaExamenPractico: string
  academiaFormadora: string

  // Sección 4: Roles y Especialidades
  roles: string[]
  especialidades: string[]

  // Sección 5: Estado y Observaciones
  estado: EstadoArbitro
  observaciones: string
  declaracionJurada: boolean
}

// ==================== DATOS PUNO ====================
const DISTRITOS_PUNO = [
  "Puno", "Juliaca", "Ilave", "Juli", "Ayaviri", "Lampa", "Moho", "Huancané",
  "Putina", "Sandia", "San Antonio de Putina", "Yunguyo", "Desaguadero",
  "Zepita", "Taraco", "Ácora", "Atuncolla", "Mañazo", "Tirapata", "Nuñoa"
]

const PROVINCIAS_PUNO = [
  "Puno", "San Román", "El Collao", "Chucuito", "Huancané",
  "Lampa", "Melgar", "Moho", "San Antonio de Putina",
  "Sandia", "Yunguyo"
]

const CATEGORIAS_CODAR = [
  { value: "FIFA", label: "FIFA", desc: "Árbitros FIFA" },
  { value: "Nacional", label: "Categoría Nacional", desc: "Árbitros de categoría nacional" },
  { value: "Primera Categoría", label: "Primera Categoría", desc: "Árbitros de primera categoría" },
  { value: "Segunda Categoría", label: "Segunda Categoría", desc: "Árbitros de segunda categoría" },
  { value: "Tercera Categoría", label: "Tercera Categoría", desc: "Árbitros en formación avanzada" },
  { value: "Aspirante", label: "Aspirante", desc: "Reciente incorporación" }
]

const ROLES_CODAR = [
  { id: "arbitro_central", label: "Árbitro Central" },
  { id: "asistente_1", label: "Asistente N°1" },
  { id: "asistente_2", label: "Asistente N°2" },
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

// Generar avatar con iniciales
const generarAvatar = (nombre: string, apellido: string): string => {
  const iniciales = `${nombre.charAt(0) || 'A'}${apellido.charAt(0) || 'A'}`.toUpperCase()
  const colores = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
    'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
  ]
  const colorAleatorio = colores[Math.floor(Math.random() * colores.length)]

  return `
    <div class="w-32 h-32 rounded-full ${colorAleatorio} flex items-center justify-center text-white text-4xl font-bold">
      ${iniciales}
    </div>
  `
}

// ==================== COMPONENTES UI CORPORATIVOS ====================
const ProgressIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { number: 1, label: "Identificación" },
    { number: 2, label: "Contacto" },
    { number: 3, label: "Profesional" },
    { number: 4, label: "Roles" },
    { number: 5, label: "Finalización" }
  ]

  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Progreso del registro</h3>
        <span className="text-sm font-medium text-blue-600">Paso {currentStep} de 5</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-blue-800 transition-all duration-500"
          style={{ width: `${(currentStep / 5) * 100}%` }}
        />
      </div>
      <div className="flex justify-between mt-6">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 border-2 ${step.number === currentStep
                ? 'bg-blue-600 text-white border-blue-600'
                : step.number < currentStep
                  ? 'bg-green-100 text-green-600 border-green-600'
                  : 'bg-gray-100 text-gray-400 border-gray-300'
              }`}>
              {step.number < currentStep ? (
                <span className="font-bold">✓</span>
              ) : (
                <span className="font-bold">{step.number}</span>
              )}
            </div>
            <span className={`text-xs font-medium ${step.number <= currentStep ? 'text-gray-900' : 'text-gray-500'
              }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const SectionCard = ({
  title,
  description,
  stepNumber,
  currentStep,
  children
}: {
  title: string
  description: string
  stepNumber: number
  currentStep: number
  children: React.ReactNode
}) => {
  if (stepNumber !== currentStep) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-700">{stepNumber}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              </div>
              <p className="text-gray-600">{description}</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                Obligatorio
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-8">
        {children}
      </div>
    </div>
  )
}

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
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${className}`}
    {...props}
  />
)

const CustomSelect = ({
  value,
  onChange,
  children,
  required = false,
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
  <select
    value={value}
    onChange={onChange}
    required={required}
    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white ${className}`}
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
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${className}`}
    {...props}
  />
)

const CheckboxOption = ({
  id,
  label,
  checked,
  onChange,
  description
}: {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
}) => (
  <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
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
  onChange
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: () => void
}) => (
  <div
    className={`p-4 border rounded-lg cursor-pointer transition-all ${checked
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-gray-300'
      }`}
    onClick={onChange}
  >
    <div className="flex items-start">
      <input
        type="radio"
        id={id}
        checked={checked}
        onChange={onChange}
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
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
    >
      {children}
    </button>
  )
}

// Componente para subir foto/generar avatar
const FotoPerfil = ({
  foto,
  nombres,
  apellidoPaterno,
  onFotoChange
}: {
  foto: string
  nombres: string
  apellidoPaterno: string
  onFotoChange: (fotoUrl: string) => void
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("La imagen debe ser menor a 5MB")
        return
      }

      if (!file.type.startsWith('image/')) {
        alert("Por favor, sube una imagen válida")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        onFotoChange(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const generarAvatarAutomatico = () => {
    const avatarHTML = generarAvatar(nombres, apellidoPaterno)
    onFotoChange(avatarHTML)
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        {foto ? (
          foto.startsWith('data:image') ? (
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img
                src={foto}
                alt="Foto del árbitro"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              dangerouslySetInnerHTML={{ __html: foto }}
            />
          )
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
            <span className="text-gray-400 text-2xl">👤</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Subir Foto
        </button>

        <button
          type="button"
          onClick={generarAvatarAutomatico}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          Generar Avatar Automático
        </button>

        {foto && (
          <button
            type="button"
            onClick={() => onFotoChange("")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Eliminar
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      <p className="text-xs text-gray-500 text-center">
        Formato: JPG, PNG, GIF • Máx. 5MB
      </p>
    </div>
  )
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function NuevoArbitroPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
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
    roles: [],
    especialidades: [],
    estado: "activo",
    observaciones: "",
    declaracionJurada: false
  })

  // Calcular edad y años como árbitro cuando cambian las fechas
  useEffect(() => {
    if (form.fechaNacimiento) {
      setEdad(calcularEdad(form.fechaNacimiento))
    } else {
      setEdad(0)
    }
  }, [form.fechaNacimiento])

  useEffect(() => {
    if (form.fechaAfiliacion) {
      setAniosComoArbitro(calcularAniosComoArbitro(form.fechaAfiliacion))
    } else {
      setAniosComoArbitro(0)
    }
  }, [form.fechaAfiliacion])

  // Generar código CODAR
  const generarCodigoCODAR = useCallback(() => {
    const iniciales = `${form.apellidoPaterno.charAt(0) || '0'}${form.apellidoMaterno.charAt(0) || '0'}${form.nombres.charAt(0) || '0'}`.toUpperCase()
    const fecha = new Date().getFullYear().toString().slice(-2)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `CODAR-${fecha}-${iniciales}-${random}`
  }, [form.apellidoPaterno, form.apellidoMaterno, form.nombres])

  // Actualizar formulario
  const updateForm = useCallback((updates: Partial<ArbitroData>) => {
    setForm(prev => ({ ...prev, ...updates }))
    // Limpiar errores del campo actualizado
    const fieldName = Object.keys(updates)[0]
    if (fieldName && errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }, [errors])

  // Validar paso actual
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!form.apellidoPaterno.trim()) newErrors.apellidoPaterno = "Apellido paterno es requerido"
      if (!form.nombres.trim()) newErrors.nombres = "Nombres son requeridos"
      if (!form.dni.trim()) newErrors.dni = "DNI es requerido"
      if (!form.dni.match(/^\d{8}$/)) newErrors.dni = "DNI debe tener 8 dígitos"
      if (!form.fechaNacimiento) newErrors.fechaNacimiento = "Fecha de nacimiento es requerida"
      if (!form.lugarNacimiento.trim()) newErrors.lugarNacimiento = "Lugar de nacimiento es requerido"
      if (!form.sexo) newErrors.sexo = "Sexo es requerido"
      if (!form.estatura.trim()) newErrors.estatura = "Estatura es requerida"
      if (form.estatura && !/^\d+(\.\d{1,2})?$/.test(form.estatura)) newErrors.estatura = "Estatura debe ser un número válido"
    }

    if (step === 2) {
      if (!form.provincia) newErrors.provincia = "Provincia es requerida"
      if (!form.distrito) newErrors.distrito = "Distrito es requerido"
      if (!form.direccion.trim()) newErrors.direccion = "Dirección es requerida"
      if (!form.telefono.trim()) newErrors.telefono = "Teléfono es requerido"
      if (!form.email.trim()) newErrors.email = "Email es requerido"
      if (!form.email.includes('@')) newErrors.email = "Email inválido"
    }

    if (step === 3) {
      if (!form.fechaAfiliacion) newErrors.fechaAfiliacion = "Fecha de afiliación es requerida"
      if (!form.fechaExamenTeorico) newErrors.fechaExamenTeorico = "Fecha examen teórico es requerida"
      if (!form.fechaExamenPractico) newErrors.fechaExamenPractico = "Fecha examen práctico es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Navegación entre pasos
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Envío final
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.declaracionJurada) {
      alert("Debe aceptar la declaración jurada para continuar")
      return
    }

    if (!validateStep(5)) return

    setLoading(true)

    try {
      const codigoCompleto = generarCodigoCODAR()

      const arbitroData = {
        ...form,
        edad,
        aniosComoArbitro,
        codigoCODAR: codigoCompleto,
        fechaRegistro: new Date().toISOString(),
        comision: "CODAR-Puno",
        departamento: "Puno"
      }

      console.log('Registro CODAR:', arbitroData)

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      router.push(`/dashboard/arbitros?registro=exitoso&codigo=${codigoCompleto}`)

    } catch (error) {
      console.error('Error:', error)
      alert("Error en el registro. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // Efecto para validar paso al cargar
  useEffect(() => {
    validateStep(currentStep)
  }, [currentStep])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* HEADER CORPORATIVO */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/arbitros"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">
                  <span className="text-lg">←</span>
                </div>
                <span className="font-medium">Volver al listado</span>
              </Link>
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Comisión Departamental de Árbitros</h1>
              <p className="text-sm text-gray-600">Departamento de Puno • Sistema de Registro</p>
            </div>

            <div className="text-right">
              <div className="inline-flex flex-col items-end">
                <span className="text-xs font-medium text-gray-500">Código CODAR (Generado automáticamente)</span>
                <span className="text-lg font-bold text-blue-700 font-mono">{generarCodigoCODAR()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <ProgressIndicator currentStep={currentStep} />

        <form onSubmit={handleSubmit}>
          {/* SECCIÓN 1: IDENTIFICACIÓN */}
          <SectionCard
            title="Identificación del Árbitro"
            description="Información personal básica del nuevo árbitro"
            stepNumber={1}
            currentStep={currentStep}
          >
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Columna izquierda - Foto */}
              <div className="lg:w-1/3">
                <div className="sticky top-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Foto de Perfil</h3>
                  <FotoPerfil
                    foto={form.foto}
                    nombres={form.nombres}
                    apellidoPaterno={form.apellidoPaterno}
                    onFotoChange={(fotoUrl) => updateForm({ foto: fotoUrl })}
                  />
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Recomendación:</strong> Sube una foto profesional o genera un avatar automático con las iniciales del árbitro.
                    </p>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Formulario */}
              <div className="lg:w-2/3 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField label="Apellido Paterno" required error={errors.apellidoPaterno}>
                    <CustomInput
                      value={form.apellidoPaterno}
                      onChange={(e) => updateForm({ apellidoPaterno: e.target.value })}
                      placeholder="Ingrese apellido paterno"
                    />
                  </InputField>

                  <InputField label="Apellido Materno">
                    <CustomInput
                      value={form.apellidoMaterno}
                      onChange={(e) => updateForm({ apellidoMaterno: e.target.value })}
                      placeholder="Ingrese apellido materno"
                    />
                  </InputField>

                  <InputField label="Nombres Completos" required error={errors.nombres}>
                    <CustomInput
                      value={form.nombres}
                      onChange={(e) => updateForm({ nombres: e.target.value })}
                      placeholder="Ingrese nombres completos"
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
                    />
                  </InputField>

                  <InputField label="Fecha de Nacimiento" required error={errors.fechaNacimiento}>
                    <div className="space-y-2">
                      <CustomInput
                        type="date"
                        value={form.fechaNacimiento}
                        onChange={(e) => updateForm({ fechaNacimiento: e.target.value })}
                        max={new Date().toISOString().split('T')[0]}
                      />
                      {form.fechaNacimiento && (
                        <div className="text-sm text-blue-600 font-medium">
                          Edad calculada: {edad} años
                        </div>
                      )}
                    </div>
                  </InputField>

                  <InputField label="Lugar de Nacimiento" required error={errors.lugarNacimiento}>
                    <CustomInput
                      value={form.lugarNacimiento}
                      onChange={(e) => updateForm({ lugarNacimiento: e.target.value })}
                      placeholder="Ciudad, Departamento"
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Sexo" required error={errors.sexo}>
                    <CustomSelect
                      value={form.sexo}
                      onChange={(e) => updateForm({ sexo: e.target.value as Sexo })}
                    >
                      <option value="">Seleccionar sexo</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                    </CustomSelect>
                  </InputField>

                  <InputField label="Estatura (cm)" required error={errors.estatura}>
                    <CustomInput
                      value={form.estatura}
                      onChange={(e) => updateForm({ estatura: e.target.value })}
                      placeholder="Ej: 175"
                      type="number"
                      min="100"
                      max="250"
                      step="0.1"
                    />
                  </InputField>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* SECCIÓN 2: CONTACTO */}
          <SectionCard
            title="Contacto y Domicilio"
            description="Información de contacto y ubicación en el departamento"
            stepNumber={2}
            currentStep={currentStep}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="Provincia" required error={errors.provincia}>
                  <CustomSelect
                    value={form.provincia}
                    onChange={(e) => updateForm({ provincia: e.target.value })}
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
                  >
                    <option value="">Seleccionar distrito</option>
                    {DISTRITOS_PUNO.map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </CustomSelect>
                </InputField>

                <InputField label="Dirección" required error={errors.direccion}>
                  <CustomInput
                    value={form.direccion}
                    onChange={(e) => updateForm({ direccion: e.target.value })}
                    placeholder="Calle, número, referencia"
                  />
                </InputField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="Teléfono / WhatsApp" required error={errors.telefono}>
                  <CustomInput
                    value={form.telefono}
                    onChange={(e) => updateForm({ telefono: e.target.value })}
                    placeholder="Número de contacto"
                  />
                </InputField>

                <InputField label="Teléfono de Emergencia">
                  <CustomInput
                    value={form.telefonoEmergencia}
                    onChange={(e) => updateForm({ telefonoEmergencia: e.target.value })}
                    placeholder="Contacto alternativo"
                  />
                </InputField>

                <InputField label="Correo Electrónico" required error={errors.email}>
                  <CustomInput
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm({ email: e.target.value })}
                    placeholder="correo@codarpuno.com"
                  />
                </InputField>
              </div>
            </div>
          </SectionCard>

          {/* SECCIÓN 3: PROFESIONAL */}
          <SectionCard
            title="Datos Profesionales"
            description="Información de categoría y certificaciones"
            stepNumber={3}
            currentStep={currentStep}
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
                      onChange={() => updateForm({ categoria: cat.value as Categoria })}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="Fecha de Afiliación" required error={errors.fechaAfiliacion}>
                  <div className="space-y-2">
                    <CustomInput
                      type="date"
                      value={form.fechaAfiliacion}
                      onChange={(e) => updateForm({ fechaAfiliacion: e.target.value })}
                    />
                    {form.fechaAfiliacion && (
                      <div className="text-sm text-blue-600 font-medium">
                        Tiempo como árbitro: {aniosComoArbitro} años
                      </div>
                    )}
                  </div>
                </InputField>

                <InputField label="Examen Teórico" required error={errors.fechaExamenTeorico}>
                  <CustomInput
                    type="date"
                    value={form.fechaExamenTeorico}
                    onChange={(e) => updateForm({ fechaExamenTeorico: e.target.value })}
                  />
                </InputField>

                <InputField label="Examen Práctico" required error={errors.fechaExamenPractico}>
                  <CustomInput
                    type="date"
                    value={form.fechaExamenPractico}
                    onChange={(e) => updateForm({ fechaExamenPractico: e.target.value })}
                  />
                </InputField>
              </div>

              <InputField label="Escuela Formadora">
                <CustomInput
                  value={form.academiaFormadora}
                  onChange={(e) => updateForm({ academiaFormadora: e.target.value })}
                  placeholder="Institución donde recibió formación"
                />
              </InputField>
            </div>
          </SectionCard>

          {/* SECCIÓN 4: ROLES */}
          <SectionCard
            title="Roles y Especialidades"
            description="Funciones arbitrales y modalidades deportivas"
            stepNumber={4}
            currentStep={currentStep}
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
                        updateForm({
                          roles: checked
                            ? [...form.roles, role.id]
                            : form.roles.filter(r => r !== role.id)
                        })
                      }}
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
                        updateForm({
                          especialidades: checked
                            ? [...form.especialidades, esp.id]
                            : form.especialidades.filter(e => e !== esp.id)
                        })
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* SECCIÓN 5: FINALIZACIÓN */}
          <SectionCard
            title="Finalización del Registro"
            description="Estado del árbitro y declaración administrativa"
            stepNumber={5}
            currentStep={currentStep}
          >
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado Inicial del Árbitro</h3>
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
                      onChange={() => updateForm({ estado: estado.value as EstadoArbitro })}
                    />
                  ))}
                </div>
              </div>

              <InputField label="Observaciones Administrativas">
                <CustomTextarea
                  value={form.observaciones}
                  onChange={(e) => updateForm({ observaciones: e.target.value })}
                  placeholder="Notas, comentarios o información adicional relevante para el registro"
                  rows={4}
                />
              </InputField>

              <div className="border-t border-gray-200 pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      id="declaracionJurada"
                      checked={form.declaracionJurada}
                      onChange={(e) => updateForm({ declaracionJurada: e.target.checked })}
                      className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <label htmlFor="declaracionJurada" className="block text-sm font-medium text-gray-900 mb-2">
                        Declaración Jurada CODAR-Puno
                      </label>
                      <p className="text-sm text-gray-600">
                        Como administrador autorizado de la Comisión Departamental de Árbitros de Fútbol de Puno,
                        declaro bajo juramento que toda la información proporcionada en este formulario es verídica
                        y que el árbitro cumple con los requisitos establecidos en el reglamento interno del CODAR.
                        Autorizo formalmente su registro en el sistema departamental de arbitraje.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RESUMEN DE DATOS CALCULADOS */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Registro</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Edad calculada</p>
                    <p className="text-lg font-semibold text-blue-700">{edad} años</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tiempo como árbitro</p>
                    <p className="text-lg font-semibold text-blue-700">{aniosComoArbitro} años</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Código CODAR</p>
                    <p className="text-lg font-semibold text-blue-700 font-mono">{generarCodigoCODAR()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Foto/avatar</p>
                    <p className="text-lg font-semibold text-blue-700">
                      {form.foto ? "Subida/Generada" : "Pendiente"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* NAVEGACIÓN */}
          <div className="mt-8 flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || loading}
            >
              Paso anterior
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                {currentStep === 5 ? "Finalizar registro" : `Paso ${currentStep} de 5`}
              </span>
            </div>

            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={nextStep}
                variant="primary"
              >
                Continuar al siguiente paso
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !form.declaracionJurada}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">↻</span>
                    Procesando registro...
                  </span>
                ) : (
                  "Completar registro del árbitro"
                )}
              </Button>
            )}
          </div>
        </form>

        {/* PIE CORPORATIVO */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Comisión Departamental de Árbitros de Fútbol • Departamento de Puno
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Sistema de Gestión Arbitral • Versión 1.0 • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}