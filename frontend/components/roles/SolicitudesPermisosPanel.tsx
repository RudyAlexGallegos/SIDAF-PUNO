'use client';

import { useState, useEffect } from 'react';
import { rolesService } from '@/services/rolesService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface SolicitudPermiso {
  id: number;
  usuario: { id: number; nombre: string; apellido: string; dni: string };
  permiso: { id: number; codigo: string; nombre: string };
  descripcion: string;
  estado: string;
  solicitadoEn: string;
}

export function SolicitudesPermisosPanel() {
  const [solicitudes, setSolicitudes] = useState<SolicitudPermiso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRazon, setSelectedRazon] = useState<{ [key: number]: string }>({});
  const [procesando, setProcesando] = useState<number | null>(null);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      setError(null);
      const solicitudesData = await rolesService.obtenerSolicitudesPendientes();
      setSolicitudes(solicitudesData);
    } catch (err) {
      setError('Error al cargar solicitudes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (solicitudId: number, usuarioId: number) => {
    try {
      setProcesando(solicitudId);
      const usuarioAdminId = localStorage.getItem('usuarioId') || '1';
      const razon = selectedRazon[solicitudId] || 'Solicitud aprobada';

      await rolesService.aprobarSolicitudPermiso(solicitudId, parseInt(usuarioAdminId), razon);
      
      // Actualizar lista
      setSolicitudes(solicitudes.filter(s => s.id !== solicitudId));
    } catch (err) {
      setError('Error al aprobar solicitud');
      console.error(err);
    } finally {
      setProcesando(null);
    }
  };

  const handleRechazar = async (solicitudId: number) => {
    try {
      setProcesando(solicitudId);
      const usuarioAdminId = localStorage.getItem('usuarioId') || '1';
      const razon = selectedRazon[solicitudId] || 'Solicitud no aprobada';

      await rolesService.rechazarSolicitudPermiso(solicitudId, parseInt(usuarioAdminId), razon);
      
      // Actualizar lista
      setSolicitudes(solicitudes.filter(s => s.id !== solicitudId));
    } catch (err) {
      setError('Error al rechazar solicitud');
      console.error(err);
    } finally {
      setProcesando(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Permisos</CardTitle>
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
        <CardTitle>Solicitudes de Permisos Adicionales</CardTitle>
        <CardDescription>
          {solicitudes.length === 0 ? 'No hay solicitudes pendientes' : `${solicitudes.length} solicitud(es) esperando revisión`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-red-100 p-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {solicitudes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>¡Todas las solicitudes han sido procesadas!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {solicitudes.map((solicitud) => (
              <div key={solicitud.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50">
                <div className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {solicitud.usuario.nombre} {solicitud.usuario.apellido}
                      </h3>
                      <p className="text-sm text-gray-600">Permiso: {solicitud.permiso.nombre}</p>
                      <p className="text-sm text-gray-600">Código: {solicitud.permiso.codigo}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      {solicitud.estado}
                    </span>
                  </div>
                  
                  <div className="mt-2 p-3 bg-gray-100 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Motivo:</strong> {solicitud.descripcion}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Solicitado: {new Date(solicitud.solicitadoEn).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tu comentario:
                  </label>
                  <textarea
                    className="w-full text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Escribe tu decisión..."
                    rows={2}
                    value={selectedRazon[solicitud.id] || ''}
                    onChange={(e) => setSelectedRazon({ ...selectedRazon, [solicitud.id]: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAprobar(solicitud.id, solicitud.usuario.id)}
                    disabled={procesando === solicitud.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {procesando === solicitud.id ? (
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
                    onClick={() => handleRechazar(solicitud.id)}
                    disabled={procesando === solicitud.id}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {procesando === solicitud.id ? (
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
