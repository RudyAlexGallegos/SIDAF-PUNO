"use client"

import { useState, useEffect } from "react"
import { getStoredUser, actualizarPerfil, cambiarPassword, completarPerfil, Usuario } from "@/services/api"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function PerfilPage() {
    const router = useRouter()
    const [usuario, setUsuario] = useState<Usuario | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [mensaje, setMensaje] = useState("")
    const [error, setError] = useState("")

    // Datos del perfil
    const [nombre, setNombre] = useState("")
    const [apellido, setApellido] = useState("")
    const [email, setEmail] = useState("")
    const [telefono, setTelefono] = useState("")
    
    // Campos CODAR
    const [cargoCodar, setCargoCodar] = useState("")
    const [areaCodar, setAreaCodar] = useState("")

    // Contraseña
    const [passwordActual, setPasswordActual] = useState("")
    const [nuevaPassword, setNuevaPassword] = useState("")
    const [confirmarPassword, setConfirmarPassword] = useState("")

    // Verificar si es usuario CODAR que necesita completar perfil
    const isCODARUser = usuario?.rol === "CODAR"
    const needsProfileCompletion = isCODARUser && !usuario?.perfilCompleto

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
        setCargoCodar(user.cargoCodar || "")
        setAreaCodar(user.areaCodar || "")
        setLoading(false)
    }, [router])

    const handleGuardarPerfil = async () => {
        setSaving(true)
        setError("")
        setMensaje("")

        try {
            // Si es un usuario CODAR que necesita completar perfil
            if (needsProfileCompletion) {
                const result = await completarPerfil({
                    dni: usuario?.dni || "",
                    telefono,
                    cargoCodar,
                    areaCodar
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
                setMensaje("¡Perfil completado exitosamente! Ya puedes acceder al sistema.")
                // Redireccionar al dashboard
                setTimeout(() => {
                    router.push("/dashboard")
                }, 1500)
            } else {
                // Actualización normal de perfil
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
            }
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
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-slate-500">Cargando...</p>
                </div>
            </div>
        )
    }

    // Mensaje para usuarios que necesitan completar su perfil
    if (needsProfileCompletion) {
        return (
            <div className="container mx-auto p-4 md:p-6 max-w-2xl">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <h2 className="text-lg font-semibold text-amber-800 mb-2">
                        ⚠️ Completa tu perfil
                    </h2>
                    <p className="text-amber-700 text-sm">
                        Para acceder al sistema, necesitas completar tu información de perfil. 
                        Por favor ingresa tus datos a continuación.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Información de Perfil - CODAR</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Información básica (solo lectura) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>DNI</Label>
                                <Input value={usuario?.dni} disabled className="bg-slate-100" />
                            </div>
                            <div>
                                <Label>Nombre</Label>
                                <Input value={nombre} disabled className="bg-slate-100" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Apellido</Label>
                                <Input value={apellido} disabled className="bg-slate-100" />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input value={email} disabled className="bg-slate-100" />
                            </div>
                        </div>

                        {/* Campos obligatorios para CODAR */}
                        <div className="border-t pt-4 mt-4">
                            <h3 className="font-medium text-slate-800 mb-4">
                                Datos Laborales - CODAR <span className="text-red-500">*</span>
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="telefono">Teléfono de contacto</Label>
                                    <Input
                                        id="telefono"
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                        placeholder="Ej. 951123456"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <Label htmlFor="cargoCodar">Cargo en CODAR</Label>
                                    <Input
                                        id="cargoCodar"
                                        value={cargoCodar}
                                        onChange={(e) => setCargoCodar(e.target.value)}
                                        placeholder="Ej. Secretario, Tesorero, Vocal"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <Label htmlFor="areaCodar">Área / Departamento</Label>
                                    <Input
                                        id="areaCodar"
                                        value={areaCodar}
                                        onChange={(e) => setAreaCodar(e.target.value)}
                                        placeholder="Ej. Unidad Técnica, Administración"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {mensaje && (
                            <div className="bg-green-100 text-green-700 p-3 rounded">{mensaje}</div>
                        )}
                        {error && (
                            <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>
                        )}

                        <Button 
                            onClick={handleGuardarPerfil} 
                            disabled={saving || !telefono || !cargoCodar || !areaCodar}
                            className="w-full"
                        >
                            {saving ? "Guardando..." : "Completar Perfil"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
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
                            <Label>DNI</Label>
                            <Input value={usuario?.dni || ""} disabled className="bg-slate-100" />
                        </div>
                        <div>
                            <Label>Rol</Label>
                            <Input value={usuario?.rol || ""} disabled className="bg-slate-100" />
                        </div>
                    </div>
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

                    {/* Mostrar info CODAR si aplica */}
                    {isCODARUser && (
                        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                            <h4 className="font-medium text-blue-800">Información CODAR</h4>
                            <p className="text-sm text-blue-700"><strong>Cargo:</strong> {cargoCodar || "No especificado"}</p>
                            <p className="text-sm text-blue-700"><strong>Área:</strong> {areaCodar || "No especificado"}</p>
                        </div>
                    )}

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
