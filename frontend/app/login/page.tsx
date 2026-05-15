"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ShieldCheck, User, UserPlus, Loader2, BadgeCheck, Zap, Users, Trophy } from "lucide-react"
import { login } from "@/services/api"

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

export default function LoginPage() {
    const router = useRouter()

    const [dni, setDni] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const user = await login(dni, password)
            
            // Verificar si el usuario necesita completar su perfil
            if ((user.rol === "CODAR" || user.rol === "UNIDAD_TECNICA_CODAR" || user.rol === "UNIDAD_TECNICA") && !user.perfilCompleto) {
                router.push("/dashboard/perfil")
            } else {
                router.push("/dashboard")
            }
        } catch (err: any) {
            setError(err.message || "Error al iniciar sesión")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative px-4 py-8 overflow-hidden bg-gradient-to-br from-sky-50 to-white">
            {/* Subtle gradient orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-100/20 rounded-full blur-3xl" style={{ animationDuration: '6s' }} />

            <div className="flex w-full max-w-7xl gap-0 z-10">
                {/* Left side - Info section (hidden on mobile) */}
                <div className="hidden lg:flex flex-col justify-center w-1/2 pr-12">
                    <div className="space-y-12">
                        {/* Header */}
                        <div className="space-y-4">
                            <div className="inline-block">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
                                    <Trophy className="h-7 w-7 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-sky-900 mb-2">SIDAF PUNO</h1>
                                <p className="text-base text-sky-700 leading-relaxed">
                                    Sistema Inteligente de Designación de Árbitros de Fútbol
                                </p>
                                <p className="text-sm text-sky-600 font-medium mt-2">
                                    Comisión Departamental de Árbitros del Departamento de Puno
                                </p>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start group">
                                <div className="h-10 w-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-200 transition-colors">
                                    <Zap className="h-5 w-5 text-sky-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sky-900 mb-1">Gestión Eficiente</h3>
                                    <p className="text-sm text-sky-700">Designa árbitros automáticamente en segundos</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start group">
                                <div className="h-10 w-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-200 transition-colors">
                                    <Users className="h-5 w-5 text-sky-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sky-900 mb-1">Control de Permisos</h3>
                                    <p className="text-sm text-sky-700">Sistema jerárquico de roles y permisos</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start group">
                                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sky-900 mb-1">Seguridad Certificada</h3>
                                    <p className="text-sm text-sky-700">Autenticación segura y auditoría completa</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Login card */}
                <div className="w-full lg:w-1/2 flex items-center justify-center">
                    <Card className="w-full max-w-sm shadow-lg border border-sky-200 bg-white relative overflow-hidden">
                        {/* Top accent line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-sky-400" />
                        
                        <CardHeader className="space-y-6 text-center pb-8">
                            {/* Mobile logo */}
                            <div className="lg:hidden flex justify-center">
                                <div className="relative">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
                                        <Trophy className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-600 rounded-full flex items-center justify-center border-2 border-white">
                                        <BadgeCheck className="h-3.5 w-3.5 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <CardTitle className="text-2xl font-bold text-sky-900 tracking-wide">
                                    Ingresar al Sistema
                                </CardTitle>
                                <CardDescription className="text-sm text-sky-600">
                                    Acceso seguro para árbitros y directivos
                                </CardDescription>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* DNI */}
                                <div className="space-y-2">
                                    <Label htmlFor="dni" className="text-sky-900 text-sm font-medium">Número de DNI</Label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400 group-focus-within:text-sky-600 transition-colors" />
                                        <Input
                                            id="dni"
                                            type="text"
                                            value={dni}
                                            onChange={(e) => setDni(e.target.value)}
                                            placeholder="Ej. 12345678"
                                            className="pl-10 bg-sky-50 border-sky-200 text-sky-900 placeholder:text-sky-400 focus:border-sky-500 focus:ring-sky-500/50 focus:ring-2 focus:ring-offset-0 transition-all h-11"
                                            maxLength={8}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {/* CONTRASEÑA */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sky-900 text-sm font-medium">Contraseña</Label>
                                    <div className="relative group">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Ingrese su contraseña"
                                            className="pr-10 bg-sky-50 border-sky-200 text-sky-900 placeholder:text-sky-400 focus:border-sky-500 focus:ring-sky-500/50 focus:ring-2 focus:ring-offset-0 transition-all h-11"
                                            required
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400 hover:text-sky-600 transition-colors"
                                            disabled={loading}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* ERROR */}
                                {error && (
                                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3 animate-in fade-in">
                                        <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-red-600 text-xs font-bold">!</span>
                                        </div>
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* MENSAJE DE CARGA */}
                                {loading && (
                                    <div className="bg-sky-50 border border-sky-200 rounded-lg px-4 py-3 animate-in fade-in">
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="h-4 w-4 text-sky-600 animate-spin flex-shrink-0" />
                                            <div className="text-sm">
                                                <p className="text-sky-900 font-medium">Verificando credenciales...</p>
                                                <p className="text-sky-600 text-xs mt-1">
                                                    Por favor espere mientras validamos su acceso
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* BOTÓN */}
                                <Button
                                    type="submit"
                                    className="w-full h-11 text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-500/25 transition-all duration-200"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Autenticando...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4" />
                                            Ingresar al Sistema
                                        </span>
                                    )}
                                </Button>

                                {/* REGISTRO */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-sky-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-sky-600">o</span>
                                    </div>
                                </div>

                                <Link href="/login/registro">
                                    <Button 
                                        variant="outline" 
                                        className="w-full border-sky-200 text-sky-600 hover:bg-sky-50 hover:text-sky-700 h-11 font-medium transition-all" 
                                        type="button"
                                        disabled={loading}
                                    >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Crear una Nueva Cuenta
                                    </Button>
                                </Link>
                            </form>

                            {/* FOOTER */}
                            <div className="text-center text-xs text-sky-600 pt-6 border-t border-sky-200">
                                <div className="flex items-center justify-center gap-1.5 mb-2">
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>Acceso restringido y protegido</span>
                                </div>
                                <p className="text-sky-500">© 2026 Comisión Departamental de Árbitros - Puno</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
