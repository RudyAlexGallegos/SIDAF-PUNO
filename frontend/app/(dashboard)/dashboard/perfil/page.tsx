"use client"

import { useState, useEffect } from "react"
import { getStoredUser, actualizarPerfil, cambiarPassword, Usuario } from "@/services/api"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function PerfilPage() {
    const router = useRouter()
    const [usuario, setUsuario] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [mensaje, setMensaje] = useState("")
    const [error, setError] = useState("")

    // Datos del perfil
    const [nombre, setNombre] = useState("")
    const [apellido, setApellido] = useState("")
    const [email, setEmail] = useState("")
    const [telefono, setTelefono] = useState("")

    // Contraseña
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
        // Inicializar campos
        setNombre(user.nombre || "")
        setApellido(user.apellido || "")
        setEmail(user.email || "")
        setTelefono(user.telefono || "")
        setLoading(false)
    }, [router])

    const handleGuardarPerfil = async () => {
        setSaving(true)
        setError("")
        setMensaje("")

        try {
            await actualizarPerfil({
                nombre,
                apellido,
                email,
                telefono
            })
            setMensaje("Perfil actualizado correctamente")
            // Actualizar datos locales
            const updatedUser = { ...usuario, nombre, apellido, email, telefono }
            localStorage.setItem("user", JSON.stringify(updatedUser))
            setUsuario(updatedUser)
        } catch (err: any) {
            setError(err.message || "Error al actualizar perfil")
        } finally {
            setSaving(false)
        }
    }

    const handleCambiarPassword = async () => {
        setSaving(true)
        setError("")
        setMensaje("")

        if (nuevaPassword !== confirmarPassword) {
            setError("Las contraseñas no coinciden")
            setSaving(false)
            return
        }

        if (nuevaPassword.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres")
            setSaving(false)
            return
        }

        try {
            await cambiarPassword(passwordActual, nuevaPassword)
            setMensaje("Contraseña cambiada correctamente")
            setPasswordActual("")
            setNuevaPassword("")
            setConfirmarPassword("")
        } catch (err: any) {
            setError(err.message || "Error al cambiar contraseña")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="p-8 text-center">Cargando...</div>
    }

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-2xl">
            <h1 className="text-xl md:text-2xl font-bold mb-6">Mi Perfil</h1>

            {/* Información del usuario */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input
                                id="nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Tu nombre"
                            />
                        </div>
                        <div>
                            <Label htmlFor="apellido">Apellido</Label>
                            <Input
                                id="apellido"
                                value={apellido}
                                onChange={(e) => setApellido(e.target.value)}
                                placeholder="Tu apellido"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                        />
                    </div>
                    <div>
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                            id="telefono"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            placeholder="Tu teléfono"
                        />
                    </div>

                    {mensaje && (
                        <div className="bg-green-100 text-green-700 p-3 rounded">{mensaje}</div>
                    )}
                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>
                    )}

                    <Button 
                        onClick={handleGuardarPerfil} 
                        disabled={saving}
                        className="w-full"
                    >
                        {saving ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </CardContent>
            </Card>

            {/* Cambiar contraseña */}
            <Card>
                <CardHeader>
                    <CardTitle>Cambiar Contraseña</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="passwordActual">Contraseña Actual</Label>
                        <Input
                            id="passwordActual"
                            type="password"
                            value={passwordActual}
                            onChange={(e) => setPasswordActual(e.target.value)}
                            placeholder="Ingresa tu contraseña actual"
                        />
                    </div>
                    <div>
                        <Label htmlFor="nuevaPassword">Nueva Contraseña</Label>
                        <Input
                            id="nuevaPassword"
                            type="password"
                            value={nuevaPassword}
                            onChange={(e) => setNuevaPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>
                    <div>
                        <Label htmlFor="confirmarPassword">Confirmar Nueva Contraseña</Label>
                        <Input
                            id="confirmarPassword"
                            type="password"
                            value={confirmarPassword}
                            onChange={(e) => setConfirmarPassword(e.target.value)}
                            placeholder="Repite la nueva contraseña"
                        />
                    </div>

                    <Button 
                        onClick={handleCambiarPassword} 
                        disabled={saving || !passwordActual || !nuevaPassword}
                        className="w-full"
                        variant="outline"
                    >
                        {saving ? "Cambiando..." : "Cambiar Contraseña"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
