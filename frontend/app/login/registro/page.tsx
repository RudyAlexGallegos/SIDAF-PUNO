"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ShieldCheck, User, ArrowLeft, CheckCircle, Phone, Award, Mail, ArrowRight } from "lucide-react"
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

// Opciones predefinidas

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
    const [esExArbitro, setEsExArbirto] = useState(false)
    const [fechaNacimiento, setFechaNacimiento] = useState("")
    const [edad, setEdad] = useState<number | null>(null)
    
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
    
    // Estados para validación en tiempo real
    const [errors, setErrors] = useState<{[key: string]: string}>({})
    const [touched, setTouched] = useState<{[key: string]: boolean}>({})

    const validateField = (fieldName: string, value: string): string | null => {
        switch (fieldName) {
            case "dni":
                return validateDNI(value)
            case "email":
                return validateEmail(value)
            case "telefono":
                return validateTelefono(value)
            case "password":
                return validatePassword(value)
            case "nombre":
                if (!value || value.trim().length < 2) return "Mínimo 2 caracteres"
                if (value.trim().length > 50) return "Máximo 50 caracteres"
                return null
            case "apellido":
                if (!value || value.trim().length < 2) return "Mínimo 2 caracteres"
                if (value.trim().length > 50) return "Máximo 50 caracteres"
                return null
            case "confirmPassword":
                if (value !== password) return "Las contraseñas no coinciden"
                return null
            default:
                return null
        }
    }

    const handleFieldChange = (fieldName: string, value: string) => {
        switch (fieldName) {
            case "dni":
                setDni(value.replace(/\D/g, ""))
                break
            case "email":
                setEmail(value)
                break
            case "telefono":
                setTelefono(value)
                break
            case "password":
                setPassword(value)
                break
            case "confirmPassword":
                setConfirmPassword(value)
                break
            case "nombre":
                setNombre(value)
                break
            case "apellido":
                setApellido(value)
                break
        }

        // Actualizar errores si el campo fue tocado
        if (touched[fieldName]) {
            const error = validateField(fieldName, value)
            setErrors(prev => ({
                ...prev,
                [fieldName]: error || ""
            }))
        }
    }

    const handleFieldBlur = (fieldName: string, value: string) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }))
        const error = validateField(fieldName, value)
        setErrors(prev => ({
            ...prev,
            [fieldName]: error || ""
        }))
    }

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [registroExitoso, setRegistroExitoso] = useState(false)

    const validateDNI = (dniValue: string): string | null => {
        if (!dniValue || dniValue.length !== 8) {
            return "El DNI debe tener exactamente 8 dígitos"
        }
        if (!/^\d{8}$/.test(dniValue)) {
            return "El DNI solo debe contener números"
        }
        return null
    }

    const validateEmail = (emailValue: string): string | null => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailValue) {
            return "El correo electrónico es requerido"
        }
        if (!emailRegex.test(emailValue)) {
            return "Formato de correo electrónico inválido"
        }
        return null
    }

    const validateTelefono = (telefonoValue: string): string | null => {
        if (!telefonoValue || telefonoValue.trim().length < 7) {
            return "El teléfono debe tener al menos 7 dígitos"
        }
        if (!/^[\d+\s-()]*$/.test(telefonoValue)) {
            return "El teléfono contiene caracteres inválidos"
        }
        return null
    }

    const validatePassword = (passwordValue: string): string | null => {
        if (!passwordValue || passwordValue.length < 6) {
            return "La contraseña debe tener al menos 6 caracteres"
        }
        if (passwordValue.length > 50) {
            return "La contraseña no debe exceder 50 caracteres"
        }
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // Validaciones en orden lógico
        let validationError: string | null = null

        // Validación: DNI
        validationError = validateDNI(dni)
        if (validationError) {
            setError(validationError)
            return
        }

        // Validación: Nombre
        if (!nombre || nombre.trim().length < 2) {
            setError("El nombre debe tener al menos 2 caracteres")
            return
        }
        if (nombre.trim().length > 50) {
            setError("El nombre no debe exceder 50 caracteres")
            return
        }

        // Validación: Apellido
        if (!apellido || apellido.trim().length < 2) {
            setError("El apellido debe tener al menos 2 caracteres")
            return
        }
        if (apellido.trim().length > 50) {
            setError("El apellido no debe exceder 50 caracteres")
            return
        }

        // Validación: Email
        validationError = validateEmail(email)
        if (validationError) {
            setError(validationError)
            return
        }

        // Validación: Teléfono
        validationError = validateTelefono(telefono)
        if (validationError) {
            setError(validationError)
            return
        }

        // Validación: Contraseña
        validationError = validatePassword(password)
        if (validationError) {
            setError(validationError)
            return
        }

        // Validación: Confirmación de contraseña
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden")
            return
        }

        setLoading(true)

        try {
            // Verificar si el DNI ya está registrado
            const dniExiste = await verificarDni(dni)
            if (dniExiste) {
                setError("Ya existe un usuario registrado con este DNI. Por favor use otro DNI.")
                setLoading(false)
                return
            }

            await registro({
                dni,
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                email: email.toLowerCase().trim(),
                password,
                telefono: telefono.trim(),
                esExArbitro: esExArbitro ? "true" : "false",
                fechaNacimiento
            })

            setRegistroExitoso(true)
        } catch (err: any) {
            console.error("Error completo:", err)
            // Manejar errores específicos del backend
            const errorMessage = err.message || "Error al registrar usuario"
            
            if (errorMessage.includes("DNI")) {
                setError("El DNI ya está registrado en el sistema")
            } else if (errorMessage.includes("email")) {
                setError("El correo electrónico ya está registrado")
            } else if (errorMessage.includes("Usuario registrado")) {
                setRegistroExitoso(true)
            } else {
                setError(errorMessage)
            }
        } finally {
            setLoading(false)
        }
    }

    if (registroExitoso) {
        return (
            <div className="min-h-screen flex items-center justify-center relative px-4 py-8 overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-900 to-slate-950" />
                
                {/* Animated orbs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />

                <div className="relative z-10">
                    <Card className="w-full max-w-md shadow-2xl border border-slate-700/50 bg-slate-900/95 backdrop-blur-xl">
                        {/* Top accent line */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500" />

                        <CardHeader className="space-y-6 text-center pb-8">
                            <div className="flex justify-center">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 animate-bounce" style={{ animationDuration: '2s' }}>
                                    <CheckCircle className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <CardTitle className="text-2xl font-bold text-white">
                                    ¡Registro Exitoso!
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Su cuenta ha sido creada correctamente
                                </CardDescription>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-emerald-400 text-xs font-bold">✓</span>
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-semibold text-emerald-300">Cuenta pendiente de aprobación</p>
                                        <p className="text-slate-400 mt-1">Un administrador revisará su solicitud y le asignará un rol.</p>
                                    </div>
                                </div>
                            </div>

                            <Link href="/login" className="block">
                                <Button className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-200">
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
        <div className="min-h-screen flex items-center justify-center relative px-4 py-8 overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-900 to-slate-950" />
            
            {/* Animated orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />

            <div className="relative z-10 w-full max-w-2xl">
                <Card className="shadow-2xl border border-slate-700/50 bg-slate-900/95 backdrop-blur-xl overflow-hidden">
                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

                    <CardHeader className="space-y-6 text-center pb-8 pt-8">
                        {/* Header with back button */}
                        <Link href="/login">
                            <Button variant="ghost" size="sm" className="mx-auto hover:bg-slate-800/50 mb-2">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                        </Link>

                        <div className="flex justify-center">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                <ShieldCheck className="h-7 w-7 text-white" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-bold text-white tracking-wide">
                                Crear Nueva Cuenta
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-sm">
                                Complete el formulario como dirigente o ex-árbitro de CODAR
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-7">
                            {/* Sección: Datos Personales */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-indigo-400"></div>
                                    Datos Personales
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dni" className="text-slate-300 text-sm font-medium">DNI *</Label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                            <Input
                                                id="dni"
                                                type="text"
                                                value={dni}
                                                onChange={(e) => handleFieldChange("dni", e.target.value)}
                                                onBlur={(e) => handleFieldBlur("dni", e.target.value)}
                                                placeholder="8 dígitos"
                                                maxLength={8}
                                                className={`pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 transition-all h-11 ${
                                                    touched["dni"] && errors["dni"] ? "border-red-500" : ""
                                                }`}
                                                required
                                            />
                                        </div>
                                        {touched["dni"] && errors["dni"] && (
                                            <p className="text-xs text-red-400">{errors["dni"]}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="telefono" className="text-slate-300 text-sm font-medium">Teléfono *</Label>
                                        <div className="relative group">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                            <Input
                                                id="telefono"
                                                type="tel"
                                                value={telefono}
                                                onChange={(e) => handleFieldChange("telefono", e.target.value)}
                                                onBlur={(e) => handleFieldBlur("telefono", e.target.value)}
                                                placeholder="+51 999 999 999"
                                                className={`pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 transition-all h-11 ${
                                                    touched["telefono"] && errors["telefono"] ? "border-red-500" : ""
                                                }`}
                                                required
                                            />
                                        </div>
                                        {touched["telefono"] && errors["telefono"] && (
                                            <p className="text-xs text-red-400">{errors["telefono"]}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nombre" className="text-slate-300 text-sm font-medium">Nombres *</Label>
                                        <div className="relative group">
                                            <Input
                                                id="nombre"
                                                type="text"
                                                value={nombre}
                                                onChange={(e) => handleFieldChange("nombre", e.target.value)}
                                                onBlur={(e) => handleFieldBlur("nombre", e.target.value)}
                                                placeholder="Juan Carlos"
                                                className={`bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 transition-all h-11 ${
                                                    touched["nombre"] && errors["nombre"] ? "border-red-500" : ""
                                                }`}
                                                required
                                            />
                                        </div>
                                        {touched["nombre"] && errors["nombre"] && (
                                            <p className="text-xs text-red-400">{errors["nombre"]}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="apellido" className="text-slate-300 text-sm font-medium">Apellidos *</Label>
                                        <Input
                                            id="apellido"
                                            type="text"
                                            value={apellido}
                                            onChange={(e) => handleFieldChange("apellido", e.target.value)}
                                            onBlur={(e) => handleFieldBlur("apellido", e.target.value)}
                                            placeholder="Pérez García"
                                            className={`bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 transition-all h-11 ${
                                                touched["apellido"] && errors["apellido"] ? "border-red-500" : ""
                                            }`}
                                            required
                                        />
                                        {touched["apellido"] && errors["apellido"] && (
                                            <p className="text-xs text-red-400">{errors["apellido"]}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-300 text-sm font-medium">Correo Electrónico *</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => handleFieldChange("email", e.target.value)}
                                            onBlur={(e) => handleFieldBlur("email", e.target.value)}
                                            placeholder="correo@ejemplo.com"
                                            className={`pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 transition-all h-11 ${
                                                touched["email"] && errors["email"] ? "border-red-500" : ""
                                            }`}
                                            required
                                        />
                                    </div>
                                    {touched["email"] && errors["email"] && (
                                        <p className="text-xs text-red-400">{errors["email"]}</p>
                                    )}
                                </div>
                            </div>

                            {/* Sección: Información Adicional */}
                            <div className="space-y-4 pt-2">
                                <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-purple-400"></div>
                                    Información Adicional
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fechaNacimiento" className="text-slate-300 text-sm font-medium">Fecha de Nacimiento</Label>
                                        <div className="relative group">
                                            <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                                            <Input
                                                id="fechaNacimiento"
                                                type="date"
                                                value={fechaNacimiento}
                                                onChange={(e) => {
                                                    setFechaNacimiento(e.target.value)
                                                    calcularEdad(e.target.value)
                                                }}
                                                className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500 focus:ring-2 transition-all h-11"
                                            />
                                        </div>
                                        {edad !== null && (
                                            <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                                <span className="text-purple-400 font-medium">{edad}</span> años
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sección: Seguridad */}
                            <div className="space-y-4 pt-2">
                                <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-blue-400"></div>
                                    Seguridad
                                </h3>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-slate-300 text-sm font-medium">Contraseña *</Label>
                                    <div className="relative group">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => handleFieldChange("password", e.target.value)}
                                            onBlur={(e) => handleFieldBlur("password", e.target.value)}
                                            placeholder="Mínimo 6 caracteres"
                                            className={`pr-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all h-11 ${
                                                touched["password"] && errors["password"] ? "border-red-500" : ""
                                            }`}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {touched["password"] && errors["password"] && (
                                        <p className="text-xs text-red-400">{errors["password"]}</p>
                                    )}
                                    {password && !errors["password"] && touched["password"] && (
                                        <p className="text-xs text-green-400">✓ Contraseña válida</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-slate-300 text-sm font-medium">Confirmar Contraseña *</Label>
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
                                        onBlur={(e) => handleFieldBlur("confirmPassword", e.target.value)}
                                        placeholder="Repita su contraseña"
                                        className={`bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all h-11 ${
                                            touched["confirmPassword"] && errors["confirmPassword"] ? "border-red-500" : ""
                                        }`}
                                        required
                                    />
                                    {touched["confirmPassword"] && errors["confirmPassword"] && (
                                        <p className="text-xs text-red-400">{errors["confirmPassword"]}</p>
                                    )}
                                    {confirmPassword && !errors["confirmPassword"] && touched["confirmPassword"] && (
                                        <p className="text-xs text-green-400">✓ Las contraseñas coinciden</p>
                                    )}
                                </div>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 flex items-start gap-3 animate-in fade-in">
                                    <div className="h-5 w-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-red-500 text-xs font-bold">!</span>
                                    </div>
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Submit button */}
                            <Button
                                type="submit"
                                className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all duration-200"
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

                            {/* Divisor */}
                            <div className="relative flex items-center gap-3">
                                <div className="flex-1 h-px bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700"></div>
                                <span className="text-xs text-slate-500 font-medium">O registrate con</span>
                                <div className="flex-1 h-px bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700"></div>
                            </div>

                            {/* Opciones de registro social */}
                            <div className="space-y-3">
                                {/* Google Sign In */}
                                <Button
                                    type="button"
                                    disabled
                                    className="w-full h-11 text-sm font-medium bg-slate-800/50 hover:bg-slate-800/70 border border-slate-600 text-slate-300 transition-all duration-200 cursor-not-allowed opacity-60"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                        </svg>
                                        Registrarse con Google
                                    </span>
                                </Button>
                                <p className="text-xs text-slate-500 text-center">Esta función estará disponible proximamente</p>

                                {/* Email Sign In */}
                                <Button
                                    type="button"
                                    disabled
                                    className="w-full h-11 text-sm font-medium bg-slate-800/50 hover:bg-slate-800/70 border border-slate-600 text-slate-300 transition-all duration-200 cursor-not-allowed opacity-60"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Registrarse con Correo
                                    </span>
                                </Button>
                                <p className="text-xs text-slate-500 text-center">Esta función estará disponible proximamente</p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
