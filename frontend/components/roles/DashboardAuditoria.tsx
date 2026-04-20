'use client';

import { useState, useEffect } from 'react';
import { rolesService } from '@/services/rolesService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, FileText } from 'lucide-react';

interface AuditoriaLog {
  id: number;
  tipoCambio: string;
  usuarioAfectado?: { id: number; nombre: string; apellido: string; dni: string };
  permiso?: { id: number; codigo: string; nombre: string };
  realizadoPor?: { id: number; nombre: string; apellido: string };
  descripcion: string;
  razon?: string;
  fechaCambio: string;
}

export function DashboardAuditoria() {
  const [auditoria, setAuditoria] = useState<AuditoriaLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [filtroTipo, setFiltroTipo] = useState<string>('');

  useEffect(() => {
    cargarAuditoria();
  }, [page]);

  const cargarAuditoria = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rolesService.obtenerAuditoria(page, 20);
      setAuditoria(response.datos || []);
      setTotalElementos(response.totalElementos || 0);
    } catch (err) {
      setError('Error al cargar auditoría');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTipoColor = (tipo: string): string => {
    switch (tipo) {
      case 'ASIGNACIÓN':
        return 'bg-blue-100 text-blue-800';
      case 'REVOCACIÓN':
        return 'bg-red-100 text-red-800';
      case 'CAMBIO_ESTADO':
        return 'bg-yellow-100 text-yellow-800';
      case 'CAMBIO_ROL':
        return 'bg-purple-100 text-purple-800';
      case 'USUARIO_APROBADO':
        return 'bg-green-100 text-green-800';
      case 'USUARIO_RECHAZADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de Auditoría</CardTitle>
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
        <CardTitle>Dashboard de Auditoría</CardTitle>
        <CardDescription>
          Registro de todos los cambios en permisos y roles ({totalElementos} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-red-100 p-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 font-semibold">Tipo</th>
                <th className="text-left px-4 py-2 font-semibold">Usuario Afectado</th>
                <th className="text-left px-4 py-2 font-semibold">Permiso/Rol</th>
                <th className="text-left px-4 py-2 font-semibold">Realizado Por</th>
                <th className="text-left px-4 py-2 font-semibold">Razón</th>
                <th className="text-left px-4 py-2 font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {auditoria.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay registros de auditoría</p>
                  </td>
                </tr>
              ) : (
                auditoria.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTipoColor(log.tipoCambio)}`}>
                        {log.tipoCambio}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {log.usuarioAfectado ? (
                        <div>
                          <p className="font-medium">{log.usuarioAfectado.nombre} {log.usuarioAfectado.apellido}</p>
                          <p className="text-xs text-gray-500">{log.usuarioAfectado.dni}</p>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {log.permiso ? (
                        <div>
                          <p className="font-medium">{log.permiso.nombre}</p>
                          <p className="text-xs text-gray-500">{log.permiso.codigo}</p>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {log.realizadoPor ? (
                        <p className="font-medium">{log.realizadoPor.nombre} {log.realizadoPor.apellido}</p>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-600 max-w-xs truncate">
                      {log.razon || '-'}
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {new Date(log.fechaCambio).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalElementos > 20 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Página {page + 1}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * 20 >= totalElementos}
              className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
