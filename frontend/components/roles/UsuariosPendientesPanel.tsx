'use client';

import { useState, useEffect } from 'react';
import { rolesService } from '@/services/rolesService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Usuario {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  estado: string;
  rol?: { id: number; nombre: string; jerarquia: number };
}

export function UsuariosPendientesPanel() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRazon, setSelectedRazon] = useState<{ [key: number]: string }>({});
  const [procesando, setProcesando] = useState<number | null>(null);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const usuariosPendientes = await rolesService.obtenerUsuariosPendientes();
      setUsuarios(usuariosPendientes);
    } catch (err) {
      setError('Error al cargar usuarios pendientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (usuarioId: number) => {
    try {
      setProcesando(usuarioId);
      // Obtener ID de usuario actual desde localStorage o contexto
      const usuarioActualId = localStorage.getItem('usuarioId') || '1';
      const razon = selectedRazon[usuarioId] || 'Aprobado por PRESIDENCIA';

      await rolesService.aprobarUsuario(parseInt(usuarioActualId), parseInt(usuarioActualId), razon);
      
      // Actualizar lista
      setUsuarios(usuarios.filter(u => u.id !== usuarioId));
    } catch (err) {
      setError('Error al aprobar usuario');
      console.error(err);
    } finally {
      setProcesando(null);
    }
  };

  const handleRechazar = async (usuarioId: number) => {
    try {
      setProcesando(usuarioId);
      const usuarioActualId = localStorage.getItem('usuarioId') || '1';
      const razon = selectedRazon[usuarioId] || 'Rechazado por PRESIDENCIA';

      await rolesService.rechazarUsuario(parseInt(usuarioActualId), parseInt(usuarioActualId), razon);
      
      // Actualizar lista
      setUsuarios(usuarios.filter(u => u.id !== usuarioId));
    } catch (err) {
      setError('Error al rechazar usuario');
      console.error(err);
    } finally {
      setProcesando(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usuarios Pendientes de Aprobación</CardTitle>
          <CardDescription>Cargando...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios Pendientes de Aprobación</CardTitle>
        <CardDescription>
          {usuarios.length === 0 ? 'No hay usuarios pendientes' : `${usuarios.length} usuario(s) esperando aprobación`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-red-100 p-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {usuarios.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>¡Todos los usuarios han sido aprobados!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {usuarios.map((usuario) => (
              <div key={usuario.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {usuario.nombre} {usuario.apellido}
                    </h3>
                    <p className="text-sm text-gray-600">DNI: {usuario.dni}</p>
                    <p className="text-sm text-gray-600">Email: {usuario.email}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                    {usuario.estado}
                  </span>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Razón de la decisión:
                  </label>
                  <textarea
                    className="w-full text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Escribe tu motivo..."
                    rows={2}
                    value={selectedRazon[usuario.id] || ''}
                    onChange={(e) => setSelectedRazon({ ...selectedRazon, [usuario.id]: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAprobar(usuario.id)}
                    disabled={procesando === usuario.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {procesando === usuario.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Aprobando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprobar
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleRechazar(usuario.id)}
                    disabled={procesando === usuario.id}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {procesando === usuario.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Rechazando...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Rechazar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
