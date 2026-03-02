"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import { getArbitros, updateArbitro, Arbitro } from "@/services/api"

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
  genero: Sexo | ""
  estatura: string
  foto: string

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
  experiencia: string
  nivelPreparacion: string

  // Sección 4: Roles y Especialidades
  roles: string[]
  especialidades: string[]

  // Sección 5: Estado y Observaciones
  estado: EstadoArbitro
  observaciones: string
  declaracionJurada: boolean
}

// ==================== DATOS PUNO - ESTRUCTURA JERÁRQUICA ====================
const PROVINCIA_DISTRITOS: Record<string, string[]> = {
  Puno: ["Puno", "Ácora", "Atuncolla", "Mañazo", "Tirapata", "Paucarcolla", "San Antonio de Esquilache", "Maure", "Taquile"],
  "San Román": ["Juliaca", "Azángaro", "Samicaya", "Cuyuchí", "Huancané", "Cojata", "Huatasani", "Cuturapi", "Otoca", "Tilali"],
  "El Collao": ["Ilave", "Capazo", "Pilcuyo", "Santa Rosa", "Mañazo", "Conduriri"],
  Chucuito: ["Juli", "Desaguadero", "Zepita", "Bálvina", "Camiña", "Kelluyo", "Maure", "Pisacoma", "Pomata", "Tinicachi"],
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

// ==================== COMPONENTES UI ====================
const InputField = ({ label, children, required, error }: { label: string, children: React.ReactNode, required?: boolean, error?: string }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
)

const CustomInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`w-full px-3 py-2 border rounded-md text-sm ${props.className || ''}`} />
)

const CustomSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={`w-full px-3 py-2 border rounded-md text-sm ${props.className || ''}`} />
)

const CheckboxOption = ({ id, label, checked, onChange, disabled }: { id: string, label: string, checked: boolean, onChange: (checked: boolean) => void, disabled?: boolean }) => (
  <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${checked ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      className="w-4 h-4 text-blue-600 rounded"
    />
    <span className="text-sm">{label}</span>
  </label>
)

const SectionCard = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
  <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-500 mb-4">{description}</p>
    {children}
  </div>
)

// ==================== COMPONENTE PRINCIPAL ====================
export default function EditarArbitroPage() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode")
  const soloLectura = mode === "view"

  const [currentStep, setCurrentStep] = useState(1)
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
    genero: "",
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
    declaracionJurada: false
  })

  // Calcular edad automáticamente
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

        // Usar cast a any para propiedades adicionales
        const arb = encontrado as any

        // Parsear el nombre completo en partes
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
          if (arb.roles) {
            rolesArray = JSON.parse(arb.roles)
          }
        } catch (e) {
          rolesArray = []
        }

        // Parsear especialidades
        let especialidadesArray: string[] = []
        try {
          if (arb.especialidades) {
            especialidadesArray = JSON.parse(arb.especialidades)
          }
        } catch (e) {
          especialidadesArray = []
        }

        setForm({
          apellidoPaterno,
          apellidoMaterno,
          nombres: arb.nombre || "",
          fechaNacimiento: arb.fechaNacimiento || "",
          lugarNacimiento: arb.lugarNacimiento || "",
          dni: arb.dni || "",
          sexo: arb.sexo || arb.genero || "",
          genero: arb.genero || arb.sexo || "",
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
          const afiliacion = new Date(arb.fechaAfiliacion)
          const hoy = new Date()
          let anios = hoy.getFullYear() - afiliacion.getFullYear()
          const mes = hoy.getMonth() - afiliacion.getMonth()
          if (mes < 0 || (mes === 0 && hoy.getDate() < afiliacion.getDate())) {
            anios--
          }
          setAniosComoArbitro(Math.max(0, anios))
        }

      } catch (error) {
        console.error("Error cargando árbitro:", error)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [id, router])

  const aniosComoArbitr = form.fechaAfiliacion ? aniosComoArbitro : 0

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

  // Calcular edad cuando cambia fecha de nacimiento
  useEffect(() => {
    if (form.fechaNacimiento) {
      setEdad(calcularEdad(form.fechaNacimiento))
    } else {
      setEdad(0)
    }
  }, [form.fechaNacimiento])

  // Calcular años como árbitro
  useEffect(() => {
    if (form.fechaAfiliacion) {
      const afiliacion = new Date(form.fechaAfiliacion)
      const hoy = new Date()
      let anios = hoy.getFullYear() - afiliacion.getFullYear()
      const mes = hoy.getMonth() - afiliacion.getMonth()
      if (mes < 0 || (mes === 0 && hoy.getDate() < afiliacion.getDate())) {
        anios--
      }
      setAniosComoArbitro(Math.max(0, anios))
    } else {
      setAniosComoArbitro(0)
    }
  }, [form.fechaAfiliacion])

  // Validar paso actual
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (step === 1) {
      if (!form.nombres.trim()) newErrors.nombres = "Requerido"
      if (!form.apellidoPaterno.trim()) newErrors.apellidoPaterno = "Requerido"
      if (!form.dni.trim()) newErrors.dni = "Requerido"
      if (!form.sexo) newErrors.sexo = "Requerido"
    }
    
    if (step === 2) {
      if (!form.provincia) newErrors.provincia = "Requerido"
      if (!form.distrito) newErrors.distrito = "Requerido"
      if (!form.direccion.trim()) newErrors.direccion = "Requerido"
      if (!form.telefono.trim()) newErrors.telefono = "Requerido"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Guardar cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(currentStep)) return
    
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
        genero: form.sexo || form.genero,
        sexo: form.sexo || form.genero,
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
      {/* HEADER */}
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
              <p className="text-xs sm:text-sm text-gray-600">Comisión Departamental de Árbitros - Puno</p>
            </div>

            <div className="order-3"></div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit}>
          {/* SECCIÓN 1: IDENTIFICACIÓN */}
          <SectionCard
            title="Identificación del Árbitro"
            description="Datos personales y documento de identidad"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Nombres" required error={errors.nombres}>
                <CustomInput
                  value={form.nombres}
                  onChange={(e) => updateForm({ nombres: e.target.value })}
                  placeholder="Nombres completos"
                />
              </InputField>

              <InputField label="Apellido Paterno" required error={errors.apellidoPaterno}>
                <CustomInput
                  value={form.apellidoPaterno}
                  onChange={(e) => updateForm({ apellidoPaterno: e.target.value })}
                  placeholder="Apellido paterno"
                />
              </InputField>

              <InputField label="Apellido Materno">
                <CustomInput
                  value={form.apellidoMaterno}
                  onChange={(e) => updateForm({ apellidoMaterno: e.target.value })}
                  placeholder="Apellido materno"
                />
              </InputField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <InputField label="DNI" required error={errors.dni}>
                <CustomInput
                  value={form.dni}
                  onChange={(e) => updateForm({ dni: e.target.value })}
                  placeholder="Número de DNI"
                  maxLength={8}
                />
              </InputField>

              <InputField label="Fecha de Nacimiento">
                <CustomInput
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={(e) => updateForm({ fechaNacimiento: e.target.value })}
                />
              </InputField>

              <InputField label="Sexo" required error={errors.sexo}>
                <CustomSelect
                  value={form.sexo || form.genero}
                  onChange={(e) => updateForm({ sexo: e.target.value as Sexo, genero: e.target.value as Sexo })}
                >
                  <option value="">Seleccionar</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </CustomSelect>
              </InputField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <InputField label="Lugar de Nacimiento">
                <CustomInput
                  value={form.lugarNacimiento}
                  onChange={(e) => updateForm({ lugarNacimiento: e.target.value })}
                  placeholder="Ciudad, Departamento"
                />
              </InputField>

              <InputField label="Estatura (m)">
                <CustomInput
                  value={form.estatura}
                  onChange={(e) => updateForm({ estatura: e.target.value })}
                  placeholder="1.75"
                  step="0.01"
                />
              </InputField>
            </div>
          </SectionCard>

          {/* SECCIÓN 2: CONTACTO */}
          <SectionCard
            title="Contacto y Domicilio"
            description="Información de contacto y ubicación"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Provincia" required error={errors.provincia}>
                <CustomSelect
                  value={form.provincia}
                  onChange={(e) => {
                    updateForm({ provincia: e.target.value, distrito: "" })
                  }}
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
                  disabled={!form.provincia}
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
                />
              </InputField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
                  placeholder="Contacto de emergencia"
                />
              </InputField>

              <InputField label="Email">
                <CustomInput
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm({ email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </InputField>
            </div>
          </SectionCard>

          {/* SECCIÓN 3: DATOS PROFESIONALES */}
          <SectionCard
            title="Datos Profesionales"
            description="Información sobre categoría y formación"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Categoría">
                <CustomSelect
                  value={form.categoria}
                  onChange={(e) => updateForm({ categoria: e.target.value as Categoria })}
                >
                  {CATEGORIAS_CODAR.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </CustomSelect>
              </InputField>

              <InputField label="Fecha de Afiliación">
                <CustomInput
                  type="date"
                  value={form.fechaAfiliacion}
                  onChange={(e) => updateForm({ fechaAfiliacion: e.target.value })}
                />
              </InputField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <InputField label="Fecha Examen Teórico">
                <CustomInput
                  type="date"
                  value={form.fechaExamenTeorico}
                  onChange={(e) => updateForm({ fechaExamenTeorico: e.target.value })}
                />
              </InputField>

              <InputField label="Fecha Examen Práctico">
                <CustomInput
                  type="date"
                  value={form.fechaExamenPractico}
                  onChange={(e) => updateForm({ fechaExamenPractico: e.target.value })}
                />
              </InputField>

              <InputField label="Academia Formadora">
                <CustomInput
                  value={form.academiaFormadora}
                  onChange={(e) => updateForm({ academiaFormadora: e.target.value })}
                  placeholder="Nombre de la academia"
                />
              </InputField>
            </div>
          </SectionCard>

          {/* SECCIÓN 4: ROLES */}
          <SectionCard
            title="Roles y Especialidades"
            description="Seleccione los roles y especialidades del árbitro"
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ROLES_CODAR.map((role) => (
                  <CheckboxOption
                    key={role.id}
                    id={role.id}
                    label={role.label}
                    checked={form.roles.includes(role.id)}
                    onChange={(checked) => {
                      if (checked) {
                        updateForm({ roles: [...form.roles, role.id] })
                      } else {
                        updateForm({ roles: form.roles.filter(r => r !== role.id) })
                      }
                    }}
                    disabled={soloLectura}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Especialidades</label>
              <div className="grid grid-cols-2 gap-2">
                {ESPECIALIDADES.map((esp) => (
                  <CheckboxOption
                    key={esp.id}
                    id={esp.id}
                    label={esp.label}
                    checked={form.especialidades.includes(esp.id)}
                    onChange={(checked) => {
                      if (checked) {
                        updateForm({ especialidades: [...form.especialidades, esp.id] })
                      } else {
                        updateForm({ especialidades: form.especialidades.filter(e => e !== esp.id) })
                      }
                    }}
                    disabled={soloLectura}
                  />
                ))}
              </div>
            </div>
          </SectionCard>

          {/* SECCIÓN 5: ESTADO */}
          <SectionCard
            title="Estado y Observaciones"
            description="Estado actual del árbitro y observaciones"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <CustomSelect
                  value={form.estado}
                  onChange={(e) => updateForm({ estado: e.target.value as EstadoArbitro })}
                  disabled={soloLectura}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="suspendido">Suspendido</option>
                  <option value="licencia_medica">Licencia Médica</option>
                </CustomSelect>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de Preparación</label>
                <CustomSelect
                  value={form.nivelPreparacion}
                  onChange={(e) => updateForm({ nivelPreparacion: e.target.value })}
                  disabled={soloLectura}
                >
                  <option value="">Seleccionar nivel</option>
                  <option value="Basico">Básico</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </CustomSelect>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
              <textarea
                value={form.observaciones}
                onChange={(e) => updateForm({ observaciones: e.target.value })}
                placeholder="Observaciones adicionales..."
                rows={4}
                disabled={soloLectura}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </SectionCard>

          {/* BOTONES */}
          <div className="flex justify-end gap-4">
            <Link
              href={`/dashboard/arbitros/${id}`}
              className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
