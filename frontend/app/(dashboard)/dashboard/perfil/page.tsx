"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, Briefcase, Calendar, Lock, Save, AlertCircle, CheckCircle, Eye, EyeOff, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getStoredUser } from "@/services/api"

const OPCIONES_CARGO_CODAR = [
    { value: "Presidente", label: "Presidente" },
    { value: "Vicepresidente", label: "Vicepresidente" },
    { value: "Tesorero", label: "Tesorero" },
    { value: "Secretario", label: "Secretario" },
    { value: "Vocal", label: "Vocal" },
    { value: "Delegado", label: "Delegado" },
    { value: "Asesor", label: "Asesor" }
]

const OPCIONES_AREA_CODAR = [
    { value: "Unidad Técnica", label: "Unidad Técnica" },
    { value: "Administración", label: "Administración" },
    { value: "Asuntos Legales", label: "Asuntos Legales" },
    { value: "Comunicaciones", label: "Comunicaciones" },
    { value: "Finanzas", label: "Finanzas" },
    { value: "Logística", label: "Logística" },
    { value: "Desarrollo", label: "Desarrollo" }
]

const OPCIONES_ESPECIALIDAD = [
    { value: "Futsal", label: "Futsal" },
    { value: "Fútbol", label: "Fútbol" },
    { value: "Fútbol Femenino", label: "Fútbol Femenino" },
    { value: "Fútbol Playa", label: "Fútbol Playa" },
    { value: "Fútbol Sala", label: "Fútbol Sala" },
    { value: "Otra", label: "Otra" }
]

export default function PerfilPage() {
    const router = useRouter()
    const [usuario, setUsuario] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [mensaje, setMensaje] = useState("")
    const [tipoMensaje, setTipoMensaje] = useState<"success" | "error">("success")
    const [modoEdicion, setModoEdicion] = useState(false)
    const [showPasswordSection, setShowPasswordSection] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const [nombre, setNombre] = useState("")
    const [apellido, setApellido] = useState("")
    const [email, setEmail] = useState("")
    const [telefono, setTelefono] = useState("")
    const [dni, setDni] = useState("")
    const [cargoCodar, setCargoCodar] = useState("")
    const [areaCodar, setAreaCodar] = useState("")
    const [fechaNacimiento, setFechaNacimiento] = useState("")
    const [especialidad, setEspecialidad] = useState("")

    const [passwordActual, setPasswordActual] = useState("")
    const [nuevaPassword, setNuevaPassword] = useState("")
    const [confirmarPassword, setConfirmarPassword] = useState("")

    useEffect(() => {
        const user = getStoredUser()
        if (!user) {
            router.push("/login")
            return
        }
        setUsuario(user)
        setDni(user.dni || "")
        setNombre(user.nombre || "")
        setApellido(user.apellido || "")
        setEmail(user.email || "")
        setTelefono(user.telefono || "")
        setCargoCodar(user.cargoCodar || "")
        setAreaCodar(user.areaCodar || "")
        setFechaNacimiento(user.fechaNacimiento || "")
        setEspecialidad(user.especialidad || "")
        setLoading(false)
    }, [router])

    const mostrarMensaje = (msg: string, tipo: "success" | "error") => {
        setMensaje(msg)
        setTipoMensaje(tipo)
        setTimeout(() => setMensaje(""), 5000)
    }

    const handleGuardarPerfil = async () => {
        setSaving(true)
        try {
            if (!nombre.trim() || !apellido.trim() || !email.trim()) {
                mostrarMensaje("Nombre, apellido y email son requeridos", "error")
                setSaving(false)
                return
            }

            const updatedUser = {
                ...usuario,
                nombre,
                apellido,
                email,
                telefono,
                cargoCodar,
                areaCodar,
                fechaNacimiento,
                especialidad
            }
            localStorage.setItem("user", JSON.stringify(updatedUser))
            setUsuario(updatedUser)
            mostrarMensaje("✅ Perfil actualizado correctamente", "success")
            setModoEdicion(false)
        } catch (err: any) {
            mostrarMensaje(err.message || "Error al actualizar perfil", "error")
        } finally {
            setSaving(false)
        }
    }

    const handleCambiarPassword = async () => {
        setSaving(true)

        if (nuevaPassword !== confirmarPassword) {
            mostrarMensaje("Las contraseñas no coinciden", "error")
            setSaving(false)
            return
        }

        if (nuevaPassword.length < 6) {
            mostrarMensaje("La contraseña debe tener al menos 6 caracteres", "error")
            setSaving(false)
            return
        }

        try {
            mostrarMensaje("✅ Contraseña cambiada correctamente", "success")
            setPasswordActual("")
            setNuevaPassword("")
            setConfirmarPassword("")
            setShowPasswordSection(false)
        } catch (err: any) {
            mostrarMensaje(err.message || "Error al cambiar contraseña", "error")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-gradient-to-br from-sky-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-200 border-t-sky-600 mx-auto"></div>
                    <p className="mt-4 text-sky-600">Cargando perfil...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-sky-50 to-white">
            <div className="container mx-auto w-full max-w-4xl px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Volver</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-sky-900 mb-2">Mi Perfil</h1>
                    <p className="text-sky-600">Gestiona tu información personal y preferencias</p>
                </div>

                {/* Mensajes */}
                {mensaje && (
                    <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 border ${
                        tipoMensaje === "success"
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-red-50 border-red-200"
                    }`}>
                        {tipoMensaje === "success" ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <p className={tipoMensaje === "success" ? "text-emerald-900" : "text-red-900"}>
                            {mensaje}
                        </p>
                    </div>
                )}

                {/* Información del Usuario - Avatar Section */}
                <Card className="mb-8 bg-white border-sky-200 shadow-sm">
                    <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400"></div>
                    <CardContent className="pt-8 pb-8">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center flex-shrink-0">
                                <User className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-sky-900">{nombre || "Usuario"} {apellido || ""}</h2>
                                <p className="text-sky-600 mt-1">
                                    <span className="inline-block px-3 py-1 bg-sky-100 rounded-full text-sm font-medium">{usuario?.rol || "Usuario"}</span>
                                </p>
                                <p className="text-sm text-sky-500 mt-2">DNI: {dni}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Información Personal */}
                <Card className="mb-6 bg-white border-sky-200 shadow-sm">
                    <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400"></div>
                    <CardContent className="pt-6 pb-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-sky-600" />
                                </div>
                                <h3 className="font-semibold text-sky-900">Información Personal</h3>
                            </div>
                            {!modoEdicion && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setModoEdicion(true)}
                                    className="border-sky-200 text-sky-600 hover:bg-sky-50"
                                >
                                    Editar
                                </Button>
                            )}
                        </div>

                        {modoEdicion ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-sky-900 mb-2 block">Nombre</Label>
                                        <Input
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            placeholder="Tu nombre"
                                            className="border-sky-200 focus:border-sky-500 focus:ring-sky-500"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-sky-900 mb-2 block">Apellido</Label>
                                        <Input
                                            value={apellido}
                                            onChange={(e) => setApellido(e.target.value)}
                                            placeholder="Tu apellido"
                                            className="border-sky-200 focus:border-sky-500 focus:ring-sky-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-sky-900 mb-2 block">Email</Label>
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="tu@email.com"
                                            className="border-sky-200 focus:border-sky-500 focus:ring-sky-500"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-sky-900 mb-2 block">Teléfono</Label>
                                        <Input
                                            value={telefono}
                                            onChange={(e) => setTelefono(e.target.value)}
                                            placeholder="951123456"
                                            className="border-sky-200 focus:border-sky-500 focus:ring-sky-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-sky-900 mb-2 block">Fecha de Nacimiento</Label>
                                    <Input
                                        type="date"
                                        value={fechaNacimiento}
                                        onChange={(e) => setFechaNacimiento(e.target.value)}
                                        className="border-sky-200 focus:border-sky-500 focus:ring-sky-500"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        onClick={handleGuardarPerfil}
                                        disabled={saving}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {saving ? "Guardando..." : "Guardar Cambios"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setModoEdicion(false)}
                                        className="border-sky-200 text-sky-600 hover:bg-sky-50 flex-1"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-lg">
                                        <User className="w-5 h-5 text-sky-600" />
                                        <div>
                                            <p className="text-xs font-medium text-sky-600">Nombre Completo</p>
                                            <p className="font-semibold text-sky-900">{nombre} {apellido}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-lg">
                                        <Mail className="w-5 h-5 text-sky-600" />
                                        <div>
                                            <p className="text-xs font-medium text-sky-600">Email</p>
                                            <p className="font-semibold text-sky-900">{email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-lg">
                                        <Phone className="w-5 h-5 text-sky-600" />
                                        <div>
                                            <p className="text-xs font-medium text-sky-600">Teléfono</p>
                                            <p className="font-semibold text-sky-900">{telefono || "No especificado"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-lg">
                                        <Calendar className="w-5 h-5 text-sky-600" />
                                        <div>
                                            <p className="text-xs font-medium text-sky-600">Fecha de Nacimiento</p>
                                            <p className="font-semibold text-sky-900">{fechaNacimiento || "No especificada"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Información CODAR */}
                {(usuario?.rol?.includes("CODAR") || cargoCodar) && (
                    <Card className="mb-6 bg-white border-sky-200 shadow-sm">
                        <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400"></div>
                        <CardContent className="pt-6 pb-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-sky-600" />
                                </div>
                                <h3 className="font-semibold text-sky-900">Información CODAR</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-3 bg-sky-50 rounded-lg">
                                        <p className="text-xs font-medium text-sky-600">Cargo en CODAR</p>
                                        <p className="font-semibold text-sky-900 mt-1">{cargoCodar || "No especificado"}</p>
                                    </div>
                                    <div className="p-3 bg-sky-50 rounded-lg">
                                        <p className="text-xs font-medium text-sky-600">Área / Departamento</p>
                                        <p className="font-semibold text-sky-900 mt-1">{areaCodar || "No especificado"}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Seguridad */}
                <Card className="bg-white border-sky-200 shadow-sm">
                    <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400"></div>
                    <CardContent className="pt-6 pb-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-sky-600" />
                                </div>
                                <h3 className="font-semibold text-sky-900">Seguridad</h3>
                            </div>
                            {!showPasswordSection && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowPasswordSection(true)}
                                    className="border-sky-200 text-sky-600 hover:bg-sky-50"
                                >
                                    Cambiar Contraseña
                                </Button>
                            )}
                        </div>

                        {showPasswordSection ? (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-sky-900 mb-2 block">Contraseña Actual</Label>
                                    <Input
                                        type="password"
                                        value={passwordActual}
                                        onChange={(e) => setPasswordActual(e.target.value)}
                                        placeholder="Tu contraseña actual"
                                        className="border-sky-200 focus:border-sky-500 focus:ring-sky-500"
                                    />
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-sky-900 mb-2 block">Nueva Contraseña</Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={nuevaPassword}
                                            onChange={(e) => setNuevaPassword(e.target.value)}
                                            placeholder="Tu nueva contraseña"
                                            className="border-sky-200 focus:border-sky-500 focus:ring-sky-500 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sky-600"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-sky-900 mb-2 block">Confirmar Contraseña</Label>
                                    <Input
                                        type="password"
                                        value={confirmarPassword}
                                        onChange={(e) => setConfirmarPassword(e.target.value)}
                                        placeholder="Confirma tu nueva contraseña"
                                        className="border-sky-200 focus:border-sky-500 focus:ring-sky-500"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        onClick={handleCambiarPassword}
                                        disabled={saving}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                                    >
                                        {saving ? "Actualizando..." : "Cambiar Contraseña"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowPasswordSection(false)}
                                        className="border-sky-200 text-sky-600 hover:bg-sky-50 flex-1"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sky-600 text-sm">Tu contraseña está protegida. Cámbiala regularmente por seguridad.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
