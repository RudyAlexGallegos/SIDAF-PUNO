"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ShieldCheck, User, ArrowLeft, CheckCircle } from "lucide-react"
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

    const [dni, setDni] = useState("")
    const [nombre, setNombre] = useState("")
    const [apellido, setApellido] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
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

        setLoading(true)

        try {
            console.log("Intentando registrar en:", "http://localhost:8083/api/auth/registro")
            console.log("Datos:", { dni, nombre, email, password, rol: "ARBITRO" })
            
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
                apellido: nombre.split(' ').length > 1 ? nombre.split(' ').slice(1).join(' ') : '',
                email,
                password
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
            <Card className="w-full max-w-md shadow-xl border border-slate-200">
                <CardHeader className="space-y-4 text-center">
                    <div className="flex justify-center">
                        <div className="h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                            <ShieldCheck className="h-8 w-8 text-white" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <CardTitle className="text-xl font-semibold text-slate-900">
                            Registrarse en SIDAF PUNO
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-600 leading-snug">
                            Complete el formulario para crear su cuenta
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="dni">DNI</Label>
                            <Input
                                id="dni"
                                type="text"
                                value={dni}
                                onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                                placeholder="Ingrese su DNI (8 dígitos)"
                                maxLength={8}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="nombre">Nombre Completo</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="nombre"
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Ingrese sus nombres y apellidos"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="apellido">Apellido</Label>
                            <Input
                                id="apellido"
                                type="text"
                                value={apellido}
                                onChange={(e) => setApellido(e.target.value)}
                                placeholder="Ingrese sus apellidos"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="correo@ejemplo.com"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="password">Contraseña</Label>
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
                            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repita su contraseña"
                                required
                            />
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
