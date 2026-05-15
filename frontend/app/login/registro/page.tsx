"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ShieldCheck, User, ArrowLeft, CheckCircle, Briefcase, Phone, Award, Mail, ArrowRight } from "lucide-react"
import { registro, verificarDni } from "@/services/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export default function RegistroPage() {
    const router = useRouter()

    // Datos básicos
    const [dni, setDni] = useState("")
    const [nombre, setNombre] = useState("")
    const [apellido, setApellido] = useState("")
    const [email, setEmail] = useState("")
    const [telefono, setTelefono] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    
    // Datos de dirigente/ex-árbitro
    const [cargoCodar, setCargoCodar] = useState("")
    const [areaCodar, setAreaCodar] = useState("")
    const [esExArbitro, setEsExArbirto] = useState(false)
    const [fechaNacimiento, setFechaNacimiento] = useState("")
    const [edad, setEdad] = useState<number | null>(null)
    const [especialidad, setEspecialidad] = useState("")
    
    // Calcular edad automáticamente cuando cambia la fecha de nacimiento
    const calcularEdad = (fecha: string) => {
        if (!fecha) {
            setEdad(null)
            return
        }
        const hoy = new Date()
        const nacimiento = new Date(fecha)
        let edadCalculada = hoy.getFullYear() - nacimiento.getFullYear()
        const mes = hoy.getMonth() - nacimiento.getMonth()
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edadCalculada--
        }
        setEdad(edadCalculada)
    }
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [registroExitoso, setRegistroExitoso] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // Validaciones
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden")
            return
        }

        if (password.length < 4) {
            setError("La contraseña debe tener al menos 4 caracteres")
            return
        }

        if (dni.length !== 8) {
            setError("El DNI debe tener 8 dígitos")
            return
        }

        // Validar campos obligatorios del dirigente
        if (!cargoCodar) {
            setError("Por favor indique su cargo en CODAR")
            return
        }

        if (!areaCodar) {
            setError("Por favor indique su área de trabajo")
            return
        }

        if (!telefono) {
            setError("Por favor indique un número de teléfono")
            return
        }

        setLoading(true)

        try {
            console.log("Intentando registrar en:", "http://localhost:8083/api/auth/registro")
            console.log("Datos:", { dni, nombre, email, password, rol: "UNIDAD_TECNICA_CODAR" })
            
            // Verificar si el DNI ya está registrado
            const dniExiste = await verificarDni(dni)
            if (dniExiste) {
                setError("Ya existe un usuario registrado con este DNI")
                setLoading(false)
                return
            }

            await registro({
                dni,
                nombre,
                apellido,
                email,
                password,
                telefono,
                cargoCodar,
                areaCodar,
                esExArbitro: esExArbitro ? "true" : "false",
                fechaNacimiento,
                especialidad
            })

            setRegistroExitoso(true)
        } catch (err: any) {
            console.error("Error completo:", err)
            setError(err.message || "Error al registrar usuario - Revisa la consola")
        } finally {
            setLoading(false)
        }
    }

    if (registroExitoso) {
        return (
            <div className="min-h-screen flex items-center justify-center relative px-4 py-8 overflow-hidden bg-gradient-to-br from-sky-50 to-white">
                {/* Subtle gradient orbs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-100/20 rounded-full blur-3xl" style={{ animationDuration: '6s' }} />

                <div className="relative z-10">
                    <Card className="w-full max-w-md shadow-lg border border-emerald-200 bg-white">
                        {/* Top accent line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />

                        <CardHeader className="space-y-6 text-center pb-8">
                            <div className="flex justify-center">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 animate-bounce" style={{ animationDuration: '2s' }}>
                                    <CheckCircle className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <CardTitle className="text-2xl font-bold text-emerald-900">
                                    ¡Registro Exitoso!
                                </CardTitle>
                                <CardDescription className="text-emerald-600">
                                    Su cuenta ha sido creada correctamente
                                </CardDescription>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-emerald-600 text-xs font-bold">✓</span>
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-semibold text-emerald-900">Cuenta pendiente de aprobación</p>
                                        <p className="text-emerald-700 mt-1">Un administrador revisará su solicitud y le asignará un rol.</p>
                                    </div>
                                </div>
                            </div>

                            <Link href="/login" className="block">
                                <Button className="w-full h-11 bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-500/25 transition-all duration-200">
                                    <span className="flex items-center gap-2">
                                        Ir a Iniciar Sesión
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative px-4 py-8 overflow-hidden bg-gradient-to-br from-sky-50 to-white">
            {/* Subtle gradient orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-100/20 rounded-full blur-3xl" style={{ animationDuration: '6s' }} />

            <div className="relative z-10 w-full max-w-2xl">
                <Card className="shadow-lg border border-sky-200 bg-white overflow-hidden">
                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-sky-400" />

                    <CardHeader className="space-y-6 text-center pb-8 pt-8">
                        {/* Header with back button */}
                        <Link href="/login">
                            <Button variant="ghost" size="sm" className="mx-auto hover:bg-sky-50 mb-2 text-sky-600">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                        </Link>

                        <div className="flex justify-center">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
                                <ShieldCheck className="h-7 w-7 text-white" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-bold text-sky-900 tracking-wide">
                                Crear Nueva Cuenta
                            </CardTitle>
                            <CardDescription className="text-sky-600 text-sm">
                                Complete el formulario como dirigente o ex-árbitro de CODAR
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-7">
                            {/* Sección: Datos Personales */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-sky-600 uppercase tracking-wider flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-sky-500"></div>
                                    Datos Personales
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dni" className="text-sky-900 text-sm font-medium">DNI *</Label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400 group-focus-within:text-sky-600 transition-colors" />
                                            <Input
                                                id="dni"
                                                type="text"
                                                value={dni}
                                                onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                                                placeholder="8 dígitos"
                                                maxLength={8}
                                                className="pl-10 bg-sky-50 border-sky-200 text-sky-900 placeholder:text-sky-400 focus:border-sky-500 focus:ring-sky-500/50 focus:ring-2 transition-all h-11"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="telefono" className="text-sky-900 text-sm font-medium">Teléfono *</Label>
                                        <div className="relative group">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400 group-focus-within:text-sky-600 transition-colors" />
                                            <Input
                                                id="telefono"
                                                type="tel"
                                                value={telefono}
                                                onChange={(e) => setTelefono(e.target.value)}
                                                placeholder="+51 999 999 999"
                                                className="pl-10 bg-sky-50 border-sky-200 text-sky-900 placeholder:text-sky-400 focus:border-sky-500 focus:ring-sky-500/50 focus:ring-2 transition-all h-11"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nombre" className="text-sky-900 text-sm font-medium">Nombres *</Label>
                                        <div className="relative group">
                                            <Input
                                                id="nombre"
                                                type="text"
                                                value={nombre}
                                                onChange={(e) => setNombre(e.target.value)}
                                                placeholder="Juan Carlos"
                                                className="bg-sky-50 border-sky-200 text-sky-900 placeholder:text-sky-400 focus:border-sky-500 focus:ring-sky-500/50 focus:ring-2 transition-all h-11"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="apellido" className="text-sky-900 text-sm font-medium">Apellidos *</Label>
                                        <Input
                                            id="apellido"
                                            type="text"
                                            value={apellido}
                                            onChange={(e) => setApellido(e.target.value)}
                                            placeholder="Pérez García"
                                            className="bg-sky-50 border-sky-200 text-sky-900 placeholder:text-sky-400 focus:border-sky-500 focus:ring-sky-500/50 focus:ring-2 transition-all h-11"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sky-900 text-sm font-medium">Correo Electrónico *</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400 group-focus-within:text-sky-600 transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="correo@ejemplo.com"
                                            className="pl-10 bg-sky-50 border-sky-200 text-sky-900 placeholder:text-sky-400 focus:border-sky-500 focus:ring-sky-500/50 focus:ring-2 transition-all h-11"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sección: Información en CODAR */}
                            <div className="space-y-4 pt-2">
                                <h3 className="text-sm font-semibold text-sky-600 uppercase tracking-wider flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-sky-500"></div>
                                    Información en CODAR
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cargoCodar" className="text-sky-900 text-sm font-medium">Cargo en CODAR *</Label>
                                        <div className="relative group">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400 group-focus-within:text-sky-600 transition-colors" />
                                            <Input
                                                id="cargoCodar"
                                                type="text"
                                                value={cargoCodar}
                                                onChange={(e) => setCargoCodar(e.target.value)}
                                                placeholder="Presidente, Vocal, etc."
                                                className="pl-10 bg-sky-50 border-sky-200 text-sky-900 placeholder:text-sky-400 focus:border-sky-500 focus:ring-sky-500/50 focus:ring-2 transition-all h-11"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="fechaNacimiento" className="text-sky-900 text-sm font-medium">Fecha de Nacimiento</Label>
                                        <div className="relative group">
                                            <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400 group-focus-within:text-sky-600 transition-colors" />
                                            <Input
                                                id="fechaNacimiento"
                                                type="date"
                                                value={fechaNacimiento}
                                                onChange={(e) => {
                                                    setFechaNacimiento(e.target.value)
                                                    calcularEdad(e.target.value)
                                                }}
                                                className="pl-10 bg-sky-50 border-sky-200 text-sky-900 placeholder:text-sky-400 focus:border-sky-500 focus:ring-sky-500/50 focus:ring-2 transition-all h-11"
                                                required
                                            />
                                        </div>
                                        {edad !== null && (
                                            <p className="text-xs text-sky-600 flex items-center gap-1.5">
                                                <span className="text-sky-600 font-medium">{edad}</span> años
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sección: Seguridad */}
                            <div className="space-y-4 pt-2">
                                <h3 className="text-sm font-semibold text-sky-600 uppercase tracking-wider flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-sky-500"></div>
                                    Seguridad
                                </h3>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sky-900 text-sm font-medium">Contraseña *</Label>
                                    <div className="relative group">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Mínimo 4 caracteres"
                                            className="pr-10 bg-sky-50 border-sky-200 text-sky-900 placeholder:text-sky-400 focus:border-sky-500 focus:ring-sky-500/50 focus:ring-2 transition-all h-11"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400 hover:text-sky-600 transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-sky-900 text-sm font-medium">Confirmar Contraseña *</Label>
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repita su contraseña"
                                        className="bg-sky-50 border-sky-200 text-sky-900 placeholder:text-sky-400 focus:border-sky-500 focus:ring-sky-500/50 focus:ring-2 transition-all h-11"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3 animate-in fade-in">
                                    <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-red-600 text-xs font-bold">!</span>
                                    </div>
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Submit button */}
                            <Button
                                type="submit"
                                className="w-full h-11 text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-500/25 transition-all duration-200"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Registrando...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Crear Cuenta
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
