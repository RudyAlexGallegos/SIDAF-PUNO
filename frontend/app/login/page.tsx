"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ShieldCheck, User, UserPlus } from "lucide-react"
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
            await login(dni, password)
            router.push("/dashboard")
        } catch (err: any) {
            setError(err.message || "Error al iniciar sesión")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 px-4">
            <Card className="w-full max-w-md shadow-xl border border-slate-200">
                <CardHeader className="space-y-4 text-center">
                    {/* LOGO / IDENTIDAD */}
                    <div className="flex justify-center">
                        <div className="h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                            <ShieldCheck className="h-8 w-8 text-white" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <CardTitle className="text-xl font-semibold text-slate-900">
                            SIDAF PUNO
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-600 leading-snug">
                            Sistema Integral de Gestión Arbitral<br />
                            Comisión Departamental de Árbitros
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* DNI */}
                        <div className="space-y-1">
                            <Label htmlFor="dni">DNI</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="dni"
                                    type="text"
                                    value={dni}
                                    onChange={(e) => setDni(e.target.value)}
                                    placeholder="Ingrese su DNI"
                                    className="pl-10"
                                    maxLength={8}
                                    required
                                />
                            </div>
                        </div>

                        {/* CONTRASEÑA */}
                        <div className="space-y-1">
                            <Label htmlFor="password">Contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Ingrese su contraseña"
                                    className="pr-10"
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

                        {/* ERROR */}
                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                {error}
                            </div>
                        )}

                        {/* BOTÓN */}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "Verificando credenciales..." : "Ingresar al sistema"}
                        </Button>

                        {/* REGISTRO */}
                        <div className="text-center pt-2 border-t">
                            <p className="text-sm text-slate-600 mb-2">
                                ¿No tiene una cuenta?
                            </p>
                            <Link href="/login/registro">
                                <Button variant="outline" className="w-full" type="button">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Registrarse en el sistema
                                </Button>
                            </Link>
                        </div>

                        {/* FOOTER */}
                        <div className="text-center text-xs text-slate-500 pt-2">
                            Acceso restringido a personal autorizado
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
