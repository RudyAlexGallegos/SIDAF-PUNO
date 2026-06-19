'use client';

import { useState, useEffect } from 'react';
import { rolesService } from '@/services/rolesService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';

interface Solicitud {
  id: number;
  permisoSolicitado: string;
  estado: string;
  fechaSolicitud: string;
  fechaRespuesta?: string;
  notas?: string;
}

export default function MisSolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await rolesService.obtenerMisSolicitudes();
      setSolicitudes(data);
    } catch (err) {
      setError('Error al cargar tus solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 'secondary';
      case 'APROBADO': return 'default';
      case 'RECHAZADO': return 'destructive';
      default: return 'outline';
    }
  };

  const getBadgeLabel = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'APROBADO': return 'Aprobado';
      case 'RECHAZADO': return 'Rechazado';
      default: return estado;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Solicitudes</h1>
        <p className="text-gray-600 mt-2">
          Historial de tus solicitudes de permisos
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      ) : solicitudes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p>No tienes solicitudes registradas</p>
            <p className="text-sm mt-1">Usa "Solicitar Permiso" para pedir acceso a módulos</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {solicitudes.map((solicitud) => (
            <Card key={solicitud.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    {solicitud.permisoSolicitado}
                  </CardTitle>
                  <Badge variant={getBadgeVariant(solicitud.estado)}>
                    {getBadgeLabel(solicitud.estado)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Solicitado:</span>{' '}
                    {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {solicitud.fechaRespuesta && (
                    <p>
                      <span className="font-medium">Respondido:</span>{' '}
                      {new Date(solicitud.fechaRespuesta).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                  {solicitud.notas && (
                    <p className="mt-2 p-2 bg-gray-50 rounded text-gray-700">
                      {solicitud.notas}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
