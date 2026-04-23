"use client"

import { useState, useEffect } from "react"
import { getStoredUser, actualizarPerfil, cambiarPassword, completarPerfil, Usuario } from "@/services/api"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, Briefcase, Award, Lock, Save, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PageStructure from "@/components/PageStructure"

// Opciones predefinidas
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

// Componente de perfil uniformizado con diseño elegante del dashboard

export default function PerfilPage() {
    const router = useRouter()
    const [usuario, setUsuario] = useState<Usuario | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [mensaje, setMensaje] = useState("")
    const [tipoMensaje, setTipoMensaje] = useState<"success" | "error">("success")
    const [modoEdicion, setModoEdicion] = useState(false)
    const [showPasswordSection, setShowPasswordSection] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Datos del perfil
    const [nombre, setNombre] = useState("")
    const [apellido, setApellido] = useState("")
    const [email, setEmail] = useState("")
    const [telefono, setTelefono] = useState("")
    const [dni, setDni] = useState("")
    
    // Campos CODAR
    const [cargoCodar, setCargoCodar] = useState("")
    const [areaCodar, setAreaCodar] = useState("")
    const [fechaNacimiento, setFechaNacimiento] = useState("")
    const [edad, setEdad] = useState<number | null>(null)
    const [especialidad, setEspecialidad] = useState("")

    // Contraseña
    const [passwordActual, setPasswordActual] = useState("")
    const [nuevaPassword, setNuevaPassword] = useState("")
    const [confirmarPassword, setConfirmarPassword] = useState("")

    // Verificar si es usuario que necesita completar perfil
    const isCODARUser = usuario?.rol === "CODAR" || usuario?.rol === "UNIDAD_TECNICA_CODAR" || usuario?.rol === "UNIDAD_TECNICA"
    const needsProfileCompletion = isCODARUser && !usuario?.perfilCompleto

    // Calcular edad
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

    useEffect(() => {
        const user = getStoredUser()
        if (!user) {
            router.push("/login")
            return
        }
        setUsuario(user)
        // Inicializar campos
        setDni(user.dni || "")
        setNombre(user.nombre || "")
        setApellido(user.apellido || "")
        setEmail(user.email || "")
        setTelefono(user.telefono || "")
        setCargoCodar(user.cargoCodar || "")
        setAreaCodar(user.areaCodar || "")
        setFechaNacimiento(user.fechaNacimiento || "")
        setEspecialidad(user.especialidad || "")
        if (user.fechaNacimiento) {
            calcularEdad(user.fechaNacimiento)
        }
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
            // Validaciones
            if (!nombre.trim() || !apellido.trim()) {
                mostrarMensaje("Nombre y apellido son requeridos", "error")
                setSaving(false)
                return
            }

            if (!email.trim()) {
                mostrarMensaje("El email es requerido", "error")
                setSaving(false)
                return
            }

            // Si es un usuario CODAR que necesita completar perfil
            if (needsProfileCompletion) {
                if (!telefono.trim() || !cargoCodar.trim() || !areaCodar.trim()) {
                    mostrarMensaje("Teléfono, cargo y área son requeridos", "error")
                    setSaving(false)
                    return
                }

                const result = await completarPerfil({
                    dni: usuario?.dni || "",
                    telefono: telefono.trim(),
                    cargoCodar: cargoCodar.trim(),
                    areaCodar: areaCodar.trim()
                })
                
                // Actualizar usuario en localStorage
                const updatedUser = { 
                    ...usuario, 
                    telefono, 
                    cargoCodar, 
                    areaCodar,
                    perfilCompleto: true 
                }
                localStorage.setItem("user", JSON.stringify(updatedUser))
                setUsuario(updatedUser)
                mostrarMensaje("¡Perfil completado exitosamente!", "success")
                
                // Redireccionar al dashboard
                setTimeout(() => {
                    router.push("/dashboard")
                }, 1500)
            } else {
                // Actualización normal de perfil
                await actualizarPerfil({
                    nombre: nombre.trim(),
                    apellido: apellido.trim(),
                    email: email.trim(),
                    telefono: telefono.trim(),
                    cargoCodar: cargoCodar.trim(),
                    areaCodar: areaCodar.trim(),
                    fechaNacimiento,
                    especialidad: especialidad.trim()
                })
                
                mostrarMensaje("Perfil actualizado correctamente", "success")
                
                // Actualizar datos locales
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
                setModoEdicion(false)
            }
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
            await cambiarPassword(passwordActual, nuevaPassword)
            mostrarMensaje("Contraseña cambiada correctamente", "success")
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
            <PageStructure title="Mi Perfil" icon={User}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-slate-500">Cargando perfil...</p>
                    </div>
                </div>
            </PageStructure>
        )
    }

    // Pantalla de completar perfil para usuarios CODAR
    if (needsProfileCompletion) {
        return (
            <PageStructure title="Completar Perfil" icon={User}>
                <div className="space-y-4 md:space-y-6 lg:space-y-8">
                    {/* Header Section */}
                    <section className="border-b border-slate-700/50 pb-3 md:pb-4 lg:pb-6">
                        <p className="text-xs md:text-sm font-medium text-amber-400 uppercase tracking-wide">
                            Completar Registro
                        </p>
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mt-1">
                            Completa tu Perfil
                        </h1>
                        <p className="text-slate-300 mt-2 max-w-3xl text-xs md:text-sm lg:text-base">
                            Para acceder completamente al sistema, necesitas proporcionar algunos datos laborales adicionales.
                        </p>
                    </section>

                    {/* Alerta */}
                    <div className="bg-amber-500/10 border border-amber-500/40 border-l-4 border-l-amber-500 rounded-lg p-4 md:p-5 lg:p-6 backdrop-blur-sm shadow-lg shadow-amber-500/10">
                        <div className="flex gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-300 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-amber-200">Información requerida</h3>
                                <p className="text-sm text-amber-300/80 mt-1">
                                    Los campos marcados con <span className="font-bold text-red-400">*</span> son obligatorios para continuar.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Información de perfil */}
                    <div className="max-w-2xl mx-auto w-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-lg overflow-hidden shadow-xl shadow-slate-900/50">
                        <div className="px-6 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-900">
                            <h2 className="text-white font-semibold flex items-center gap-2 text-base md:text-lg">
                                <Briefcase className="h-5 w-5 text-indigo-400" />
                                Información Laboral CODAR
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Información básica (solo lectura) */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-slate-400 text-xs font-semibold uppercase mb-2 block">DNI</Label>
                                        <div className="px-4 py-2.5 bg-slate-700/50 rounded-lg text-slate-200 font-medium border border-slate-600/50">
                                            {usuario?.dni}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-slate-400 text-xs font-semibold uppercase mb-2 block">Nombre Completo</Label>
                                        <div className="px-4 py-2.5 bg-slate-700/50 rounded-lg text-slate-200 font-medium border border-slate-600/50">
                                            {nombre} {apellido}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Campos obligatorios */}
                            <div className="border-t border-slate-700/50 pt-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="telefono" className="text-slate-400 text-xs font-semibold uppercase mb-2 flex gap-1 block">
                                            Teléfono <span className="text-red-400">*</span>
                                        </Label>
                                        <Input
                                            id="telefono"
                                            value={telefono}
                                            onChange={(e) => setTelefono(e.target.value)}
                                            placeholder="Ej. 951123456"
                                            className="bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="cargoCodar" className="text-slate-400 text-xs font-semibold uppercase mb-2 flex gap-1 block">
                                            Cargo en CODAR <span className="text-red-400">*</span>
                                        </Label>
                                        <select
                                            id="cargoCodar"
                                            value={cargoCodar}
                                            onChange={(e) => setCargoCodar(e.target.value)}
                                            className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 rounded-lg p-2.5 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                            required
                                        >
                                            <option value="">Selecciona un cargo...</option>
                                            {OPCIONES_CARGO_CODAR.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="areaCodar" className="text-slate-400 text-xs font-semibold uppercase mb-2 flex gap-1 block">
                                        Área / Departamento <span className="text-red-400">*</span>
                                    </Label>
                                    <select
                                        id="areaCodar"
                                        value={areaCodar}
                                        onChange={(e) => setAreaCodar(e.target.value)}
                                        className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 rounded-lg p-2.5 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                        required
                                    >
                                        <option value="">Selecciona un área...</option>
                                        {OPCIONES_AREA_CODAR.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Mensajes */}
                            {mensaje && (
                                <div className={`p-4 rounded-lg flex gap-3 border ${
                                    tipoMensaje === "success" 
                                        ? "bg-emerald-500/10 border-emerald-500/40" 
                                        : "bg-red-500/10 border-red-500/40"
                                }`}>
                                    {tipoMensaje === "success" ? (
                                        <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    )}
                                    <p className={tipoMensaje === "success" ? "text-emerald-300" : "text-red-300"}>
                                        {mensaje}
                                    </p>
                                </div>
                            )}

                            <Button 
                                onClick={handleGuardarPerfil}
                                disabled={saving || !telefono.trim() || !cargoCodar.trim() || !areaCodar.trim()}
                                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all duration-300"
                            >
                                {saving ? "Completando..." : "Completar Perfil"}
                            </Button>
                        </div>
                    </div>
                </div>
            </PageStructure>
        )
    }

    // Pantalla normal de perfil
    return (
        <PageStructure title="Mi Perfil" icon={User}>
            <div className="space-y-4 md:space-y-6 lg:space-y-8">
                {/* Header Section */}
                <section className="border-b border-slate-700/50 pb-3 md:pb-4 lg:pb-6">
                    <p className="text-xs md:text-sm font-medium text-indigo-400 uppercase tracking-wide">
                        Gestión de Cuenta
                    </p>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mt-1">
                        Mi Perfil
                    </h1>
                    <p className="text-slate-300 mt-2 max-w-3xl text-xs md:text-sm lg:text-base">
                        Visualiza y actualiza tu información personal y laboral en el sistema.
                    </p>
                </section>

                {/* Resumen de estado del usuario */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
                    {/* Card: Nombre */}
                    <div className="bg-gradient-to-br from-blue-500/15 to-cyan-500/15 border border-blue-500/40 rounded-lg p-4 md:p-5 lg:p-6 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300">
                        <p className="text-xs md:text-sm font-medium text-blue-300 uppercase tracking-wide mb-2">Nombre Completo</p>
                        <p className="text-lg md:text-xl lg:text-2xl font-bold text-white">
                            {nombre} {apellido}
                        </p>
                    </div>

                    {/* Card: DNI */}
                    <div className="bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border border-indigo-500/40 rounded-lg p-4 md:p-5 lg:p-6 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300">
                        <p className="text-xs md:text-sm font-medium text-indigo-300 uppercase tracking-wide mb-2">DNI</p>
                        <p className="text-lg md:text-xl lg:text-2xl font-bold text-white">{dni}</p>
                    </div>

                    {/* Card: Rol */}
                    <div className="bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/40 rounded-lg p-4 md:p-5 lg:p-6 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300">
                        <p className="text-xs md:text-sm font-medium text-emerald-300 uppercase tracking-wide mb-2">Rol</p>
                        <div className="inline-block px-3 py-1.5 bg-gradient-to-r from-emerald-500/40 to-teal-500/40 border border-emerald-500/60 text-emerald-200 text-sm font-semibold rounded-full">
                            {usuario?.rol?.replace(/_/g, " ")}
                        </div>
                    </div>
                </div>

                {/* Mensajes */}
                {mensaje && (
                    <div className={`p-4 rounded-lg flex gap-3 animate-in fade-in border ${
                        tipoMensaje === "success" 
                            ? "bg-emerald-500/10 border-emerald-500/40" 
                            : "bg-red-500/10 border-red-500/40"
                    }`}>
                        {tipoMensaje === "success" ? (
                            <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <p className={tipoMensaje === "success" ? "text-emerald-300" : "text-red-300"}>
                            {mensaje}
                        </p>
                    </div>
                )}

                {/* Información Personal */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-lg overflow-hidden shadow-xl shadow-slate-900/50">
                    <div className="flex flex-row items-center justify-between px-6 py-4 border-b border-slate-700/50">
                        <h2 className="text-white font-semibold flex items-center gap-2 text-base md:text-lg">
                            <User className="h-5 w-5 text-indigo-400" />
                            Información Personal
                        </h2>
                        {!modoEdicion && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setModoEdicion(true)}
                                className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                            >
                                Editar
                            </Button>
                        )}
                    </div>
                    <div className="p-6 space-y-6">
                        {/* Row 1: DNI y Rol */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-slate-400 text-xs font-semibold uppercase mb-2 block">DNI</Label>
                                <div className="px-4 py-2.5 bg-slate-700/50 rounded-lg text-slate-200 font-medium border border-slate-600/50">
                                    {dni}
                                </div>
                            </div>
                            <div>
                                <Label className="text-slate-400 text-xs font-semibold uppercase mb-2 block">Rol</Label>
                                <div className="px-4 py-2.5 bg-slate-700/50 rounded-lg border border-slate-600/50">
                                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-emerald-500/40 to-teal-500/40 border border-emerald-500/60 text-emerald-200 text-xs font-medium rounded-full">
                                        {usuario?.rol?.replace(/_/g, " ") || "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Nombre y Apellido */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="nombre" className="text-slate-400 text-xs font-semibold uppercase mb-2 block">Nombres</Label>
                                {modoEdicion ? (
                                    <Input
                                        id="nombre"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        placeholder="Nombre"
                                        className="bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                    />
                                ) : (
                                    <div className="px-4 py-2.5 bg-slate-700/50 rounded-lg text-slate-200 font-medium border border-slate-600/50">
                                        {nombre || "N/A"}
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="apellido" className="text-slate-400 text-xs font-semibold uppercase mb-2 block">Apellidos</Label>
                                {modoEdicion ? (
                                    <Input
                                        id="apellido"
                                        value={apellido}
                                        onChange={(e) => setApellido(e.target.value)}
                                        placeholder="Apellido"
                                        className="bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                    />
                                ) : (
                                    <div className="px-4 py-2.5 bg-slate-700/50 rounded-lg text-slate-200 font-medium border border-slate-600/50">
                                        {apellido || "N/A"}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Row 3: Email y Teléfono */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="email" className="text-slate-400 text-xs font-semibold uppercase mb-2 flex items-center gap-2 block">
                                    <Mail className="h-3 w-3" />
                                    Email
                                </Label>
                                {modoEdicion ? (
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="correo@ejemplo.com"
                                        className="bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                    />
                                ) : (
                                    <div className="px-4 py-2.5 bg-slate-700/50 rounded-lg text-slate-200 font-medium text-sm border border-slate-600/50">
                                        {email || "N/A"}
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="telefono" className="text-slate-400 text-xs font-semibold uppercase mb-2 flex items-center gap-2 block">
                                    <Phone className="h-3 w-3" />
                                    Teléfono
                                </Label>
                                {modoEdicion ? (
                                    <Input
                                        id="telefono"
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                        placeholder="Teléfono"
                                        className="bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                    />
                                ) : (
                                    <div className="px-4 py-2.5 bg-slate-700/50 rounded-lg text-slate-200 font-medium border border-slate-600/50">
                                        {telefono || "N/A"}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Botones de edición */}
                        {modoEdicion && (
                            <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                                <Button
                                    onClick={handleGuardarPerfil}
                                    disabled={saving}
                                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/20"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {saving ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                                <Button
                                    onClick={() => {
                                        setModoEdicion(false)
                                        setNombre(usuario?.nombre || "")
                                        setApellido(usuario?.apellido || "")
                                        setEmail(usuario?.email || "")
                                        setTelefono(usuario?.telefono || "")
                                    }}
                                    variant="outline"
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                                    disabled={saving}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Información CODAR */}
                {isCODARUser && (
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/40 border-l-4 border-l-purple-500 rounded-lg overflow-hidden shadow-xl shadow-slate-900/50">
                        <div className="px-6 py-4 border-b border-slate-700/50">
                            <h2 className="text-white font-semibold flex items-center gap-2 text-base md:text-lg">
                                <Briefcase className="h-5 w-5 text-purple-400" />
                                Información Laboral CODAR
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="cargoCodar" className="text-slate-400 text-xs font-semibold uppercase mb-2 block">Cargo</Label>
                                    {modoEdicion ? (
                                        <select
                                            id="cargoCodar"
                                            value={cargoCodar}
                                            onChange={(e) => setCargoCodar(e.target.value)}
                                            className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 rounded-lg p-2.5 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                        >
                                            <option value="">Selecciona un cargo...</option>
                                            {OPCIONES_CARGO_CODAR.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="px-4 py-2.5 bg-slate-700/50 rounded-lg text-slate-200 font-medium border border-slate-600/50">
                                            {cargoCodar || "N/A"}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="areaCodar" className="text-slate-400 text-xs font-semibold uppercase mb-2 block">Área / Departamento</Label>
                                    {modoEdicion ? (
                                        <select
                                            id="areaCodar"
                                            value={areaCodar}
                                            onChange={(e) => setAreaCodar(e.target.value)}
                                            className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 rounded-lg p-2.5 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                        >
                                            <option value="">Selecciona un área...</option>
                                            {OPCIONES_AREA_CODAR.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="px-4 py-2.5 bg-slate-700/50 rounded-lg text-slate-200 font-medium border border-slate-600/50">
                                            {areaCodar || "N/A"}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="fechaNacimiento" className="text-slate-400 text-xs font-semibold uppercase mb-2 flex items-center gap-2 block">
                                        <Award className="h-3 w-3" />
                                        Fecha de Nacimiento
                                    </Label>
                                    {modoEdicion ? (
                                        <Input
                                            id="fechaNacimiento"
                                            type="date"
                                            value={fechaNacimiento}
                                            onChange={(e) => {
                                                setFechaNacimiento(e.target.value)
                                                calcularEdad(e.target.value)
                                            }}
                                            className="bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                        />
                                    ) : (
                                        <div className="px-4 py-2.5 bg-slate-700/50 rounded-lg text-slate-200 font-medium border border-slate-600/50">
                                            {fechaNacimiento ? new Date(fechaNacimiento).toLocaleDateString("es-PE") : "N/A"}
                                        </div>
                                    )}
                                    {edad !== null && (
                                        <p className="text-xs text-slate-400 mt-2">
                                            Edad: <span className="font-semibold text-purple-300">{edad} años</span>
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="especialidad" className="text-slate-400 text-xs font-semibold uppercase mb-2 block">Especialidad</Label>
                                    {modoEdicion ? (
                                        <select
                                            id="especialidad"
                                            value={especialidad}
                                            onChange={(e) => setEspecialidad(e.target.value)}
                                            className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-200 rounded-lg p-2.5 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                        >
                                            <option value="">Selecciona una especialidad...</option>
                                            {OPCIONES_ESPECIALIDAD.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="px-4 py-2.5 bg-slate-700/50 rounded-lg text-slate-200 font-medium border border-slate-600/50">
                                            {especialidad || "N/A"}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {modoEdicion && (
                                <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                                    <Button
                                        onClick={handleGuardarPerfil}
                                        disabled={saving}
                                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/20"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {saving ? "Guardando..." : "Guardar Cambios"}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setModoEdicion(false)
                                            setCargoCodar(usuario?.cargoCodar || "")
                                            setAreaCodar(usuario?.areaCodar || "")
                                        }}
                                        variant="outline"
                                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                                        disabled={saving}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Cambiar Contraseña */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-red-500/40 border-l-4 border-l-red-500 rounded-lg overflow-hidden shadow-xl shadow-slate-900/50">
                    <div className="flex flex-row items-center justify-between px-6 py-4 border-b border-slate-700/50">
                        <h2 className="text-white font-semibold flex items-center gap-2 text-base md:text-lg">
                            <Lock className="h-5 w-5 text-red-400" />
                            Seguridad
                        </h2>
                        {!showPasswordSection && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPasswordSection(true)}
                                className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                            >
                                Cambiar Contraseña
                            </Button>
                        )}
                    </div>
                    
                    {showPasswordSection && (
                        <div className="p-6 space-y-4">
                            <div>
                                <Label htmlFor="passwordActual" className="text-slate-400 text-xs font-semibold uppercase mb-2 block">Contraseña Actual</Label>
                                <div className="relative">
                                    <Input
                                        id="passwordActual"
                                        type={showPassword ? "text" : "password"}
                                        value={passwordActual}
                                        onChange={(e) => setPasswordActual(e.target.value)}
                                        placeholder="Ingresa tu contraseña actual"
                                        className="pr-10 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="nuevaPassword" className="text-slate-400 text-xs font-semibold uppercase mb-2 block">Nueva Contraseña</Label>
                                <Input
                                    id="nuevaPassword"
                                    type="password"
                                    value={nuevaPassword}
                                    onChange={(e) => setNuevaPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    className="bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                />
                            </div>

                            <div>
                                <Label htmlFor="confirmarPassword" className="text-slate-400 text-xs font-semibold uppercase mb-2 block">Confirmar Nueva Contraseña</Label>
                                <Input
                                    id="confirmarPassword"
                                    type="password"
                                    value={confirmarPassword}
                                    onChange={(e) => setConfirmarPassword(e.target.value)}
                                    placeholder="Repite la nueva contraseña"
                                    className="bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                                <Button
                                    onClick={handleCambiarPassword}
                                    disabled={saving || !passwordActual || !nuevaPassword || !confirmarPassword}
                                    className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold shadow-lg shadow-red-500/20"
                                >
                                    {saving ? "Actualizando..." : "Cambiar Contraseña"}
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowPasswordSection(false)
                                        setPasswordActual("")
                                        setNuevaPassword("")
                                        setConfirmarPassword("")
                                        setShowPassword(false)
                                    }}
                                    variant="outline"
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                                    disabled={saving}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageStructure>
    )
}
