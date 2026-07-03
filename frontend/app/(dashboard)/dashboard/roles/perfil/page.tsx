'use client';

import { useState, useEffect } from 'react';
import { rolesService } from '@/services/rolesService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, Shield, User, Mail, Phone } from 'lucide-react';

interface UsuarioInfo {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  estado: string;
  rol?: { id: number; nombre: string; jerarquia: number };
  permisos?: Array<{ id: number; codigo: string; nombre: string; modulo: string }>;
}

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<UsuarioInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const usuarioId = localStorage.getItem('usuarioId');
      if (!usuarioId) {
        setError('Usuario no identificado');
        setLoading(false);
        return;
      }

      const response = await rolesService.obtenerInfoUsuario(parseInt(usuarioId));
      setUsuario(response.datos);
    } catch (err) {
      setError('Error al cargar perfil');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !usuario) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-red-100 p-4 text-red-700">
        <AlertCircle className="h-5 w-5" />
        {error || 'Usuario no encontrado'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-gray-600 mt-2">Información de tu cuenta en SIDAF</p>
      </div>

      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Nombre Completo</p>
                <p className="font-medium">{usuario.nombre} {usuario.apellido}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{usuario.email}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">DNI</p>
              <p className="font-medium">{usuario.dni}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Estado</p>
              <p className={`font-medium px-2 py-1 rounded text-sm inline-block ${
                usuario.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' :
                usuario.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {usuario.estado}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rol y Jerarquía */}
      {usuario.rol && (
        <Card>
          <CardHeader>
            <CardTitle>Rol y Acceso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Rol Asignado</p>
                <p className="font-semibold text-lg">{usuario.rol.nombre}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>Nivel de Jerarquía:</strong> {usuario.rol.jerarquia}</p>
              <p className="mt-2">
                {usuario.rol.nombre === 'ADMINISTRADOR' && 'Tienes acceso total a todo el sistema'}
                {usuario.rol.nombre === 'PRESIDENCIA' && 'Puedes aprobar usuarios y asignar permisos'}
                {usuario.rol.nombre === 'COMISIÓN_CODAR' && 'Usuario estándar con permisos dinámicos'}
                {usuario.rol.nombre === 'UNIDAD_TÉCNICA' && 'Usuario estándar con permisos dinámicos'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permisos */}
      <Card>
        <CardHeader>
          <CardTitle>Tus Permisos</CardTitle>
          <CardDescription>
            {usuario.permisos?.length || 0} permiso(s) activo(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!usuario.permisos || usuario.permisos.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No tienes permisos asignados aún
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {usuario.permisos.map((permiso) => (
                <div key={permiso.id} className="p-3 border rounded-lg hover:shadow-md transition">
                  <p className="font-medium text-sm">{permiso.nombre}</p>
                  <p className="text-xs text-gray-600">{permiso.codigo}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {permiso.modulo}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información */}
      <Card>
        <CardHeader>
          <CardTitle>¿Necesitas más permisos?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p>Si necesitas acceso a funcionalidades adicionales:</p>
          <ol className="list-decimal list-inside space-y-1 mt-2 ml-2">
            <li>Envía una solicitud de permiso desde la sección "Mis Solicitudes"</li>
            <li>Describe por qué necesitas ese permiso</li>
            <li>PRESIDENCIA revisará y aprobará tu solicitud</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
