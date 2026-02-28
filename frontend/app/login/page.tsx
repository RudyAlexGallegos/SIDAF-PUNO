"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ShieldCheck, User, UserPlus, Loader2, BadgeCheck } from "lucide-react"
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
            
            // Verificar si el usuario CODAR necesita completar su perfil
            if (user.rol === "CODAR" && !user.perfilCompleto) {
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
        <div className="min-h-screen flex items-center justify-center relative px-4 py-8">
            {/* Professional gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
            
            {/* Decorative elements - subtle football field lines */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                <div className="absolute top-2/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />
            </div>

            {/* Card */}
            <Card className="w-full max-w-md shadow-2xl border border-slate-700/50 bg-slate-900/95 backdrop-blur-xl z-10 relative overflow-hidden">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500" />
                
                <CardHeader className="space-y-5 text-center pb-6">
                    {/* LOGO / IDENTIDAD */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                <ShieldCheck className="h-9 w-9 text-white" />
                            </div>
                            {/* Badge indicator */}
                            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                                <BadgeCheck className="h-3.5 w-3.5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold text-white tracking-wide">
                            SIDAF PUNO
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-400 leading-relaxed">
                            Sistema Integral de Designación<br />
                            <span className="text-blue-400 font-medium">Árbitros de Fútbol - Puno</span>
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* DNI */}
                        <div className="space-y-2">
                            <Label htmlFor="dni" className="text-slate-300 text-sm font-medium">Número de DNI</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input
                                    id="dni"
                                    type="text"
                                    value={dni}
                                    onChange={(e) => setDni(e.target.value)}
                                    placeholder="Ej. 12345678"
                                    className="pl-10 bg-slate-800/60 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                                    maxLength={8}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* CONTRASEÑA */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300 text-sm font-medium">Contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Ingrese su contraseña"
                                    className="pr-10 bg-slate-800/60 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
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
                            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 flex items-center gap-2">
                                <span className="text-red-500">●</span>
                                {error}
                            </div>
                        )}

                        {/* MENSAJE DE CARGA */}
                        {loading && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-3">
                                <div className="flex items-center gap-3">
                                    <Loader2 className="h-4 w-4 text-blue-400 animate-spin flex-shrink-0" />
                                    <div className="text-sm">
                                        <p className="text-blue-300 font-medium">Iniciando sesión...</p>
                                        <p className="text-slate-500 text-xs mt-0.5">
                                            Verificando credenciales en el sistema
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BOTÓN */}
                        <Button
                            type="submit"
                            className="w-full h-11 text-sm font-medium"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Autenticando...
                                </span>
                            ) : (
                                "Ingresar al Sistema"
                            )}
                        </Button>

                        {/* REGISTRO */}
                        <div className="text-center pt-3 border-t border-slate-700/50">
                            <p className="text-sm text-slate-500 mb-3">
                                ¿No tiene una cuenta registrada?
                            </p>
                            <Link href="/login/registro">
                                <Button 
                                    variant="outline" 
                                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white h-10" 
                                    type="button"
                                    disabled={loading}
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Registrarse en el Sistema
                                </Button>
                            </Link>
                        </div>

                        {/* FOOTER */}
                        <div className="text-center text-xs text-slate-600 pt-2">
                            <p className="flex items-center justify-center gap-1">
                                <ShieldCheck className="h-3 w-3" />
                                Acceso restringido a personal autorizado
                            </p>
                            <p className="text-slate-500 mt-1">
                                Comisión Departamental de Árbitros - Puno
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
