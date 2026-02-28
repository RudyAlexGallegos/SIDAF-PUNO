"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ShieldCheck, User, ArrowLeft, CheckCircle, Briefcase, MapPin, Phone, Award } from "lucide-react"
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 px-4">
                <Card className="w-full max-w-md shadow-xl border border-slate-200">
                    <CardHeader className="space-y-4 text-center">
                        <div className="flex justify-center">
                            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-semibold text-slate-900">
                                ¡Registro Exitoso!
                            </CardTitle>
                            <CardDescription className="text-sm text-slate-600">
                                Su cuenta ha sido creada correctamente
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm text-slate-600 text-center bg-slate-50 rounded-lg p-4">
                            <p className="font-medium">Su cuenta está pendiente de aprobación</p>
                            <p className="mt-2 text-sm">Un administrador revisará su solicitud y le asignará un rol. Por favor, espere ser contactado.</p>
                        </div>
                        <Link href="/login">
                            <Button className="w-full">
                                Ir a Iniciar Sesión
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 px-4 py-8">
            <Card className="w-full max-w-2xl shadow-xl border border-slate-200">
                <CardHeader className="space-y-4 text-center">
                    <div className="flex justify-center">
                        <div className="h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                            <ShieldCheck className="h-8 w-8 text-white" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <CardTitle className="text-xl font-semibold text-slate-900">
                            Registro de Dirigente CODAR
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-600 leading-snug">
                            Complete el formulario con sus datos como dirigente o ex-árbitro
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Sección: Datos Personales */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
                                Datos Personales
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="dni">DNI *</Label>
                                    <Input
                                        id="dni"
                                        type="text"
                                        value={dni}
                                        onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                                        placeholder="8 dígitos"
                                        maxLength={8}
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="telefono">Teléfono *</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="telefono"
                                            type="tel"
                                            value={telefono}
                                            onChange={(e) => setTelefono(e.target.value)}
                                            placeholder="+51 999 999 999"
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="nombre">Nombres *</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="nombre"
                                            type="text"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            placeholder="Juan Carlos"
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="apellido">Apellidos *</Label>
                                    <Input
                                        id="apellido"
                                        type="text"
                                        value={apellido}
                                        onChange={(e) => setApellido(e.target.value)}
                                        placeholder="Pérez García"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="email">Correo Electrónico *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Sección: Datos en CODAR */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
                                Información en CODAR
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="cargoCodar">Cargo en CODAR *</Label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="cargoCodar"
                                            type="text"
                                            value={cargoCodar}
                                            onChange={(e) => setCargoCodar(e.target.value)}
                                            placeholder="Presidente, Vocal, Secretario, etc."
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="areaCodar">Área de Trabajo *</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="areaCodar"
                                            type="text"
                                            value={areaCodar}
                                            onChange={(e) => setAreaCodar(e.target.value)}
                                            placeholder="Comité de Árbitros, Unidad Técnica, etc."
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="especialidad">Especialidad</Label>
                                    <Input
                                        id="especialidad"
                                        type="text"
                                        value={especialidad}
                                        onChange={(e) => setEspecialidad(e.target.value)}
                                        placeholder="Administración, Logística, Técnico Deportivo"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                                    <div className="relative">
                                        <Award className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="fechaNacimiento"
                                            type="date"
                                            value={fechaNacimiento}
                                            onChange={(e) => {
                                                setFechaNacimiento(e.target.value)
                                                calcularEdad(e.target.value)
                                            }}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                    {edad !== null && (
                                        <p className="text-sm text-slate-600">
                                            Edad: <span className="font-medium">{edad} años</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                <input
                                    id="esExArbitro"
                                    type="checkbox"
                                    checked={esExArbitro}
                                    onChange={(e) => setEsExArbirto(e.target.checked)}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <Label htmlFor="esExArbitro" className="cursor-pointer">
                                    ¿Es usted ex-árbitro de fútbol?
                                </Label>
                            </div>
                        </div>

                        {/* Sección: Seguridad */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
                                Seguridad
                            </h3>
                            
                            <div className="space-y-1">
                                <Label htmlFor="password">Contraseña *</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Mínimo 4 caracteres"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repita su contraseña"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "Registrando..." : "Crear Cuenta"}
                        </Button>

                        <div className="text-center pt-2">
                            <Link href="/login" className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-1">
                                <ArrowLeft className="h-3 w-3" />
                                Volver a Iniciar Sesión
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
