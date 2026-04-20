'use client';

import { useState, useEffect } from 'react';
import { rolesService } from '@/services/rolesService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface Usuario {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  rol?: { id: number; nombre: string; jerarquia: number };
}

interface Permiso {
  id: number;
  codigo: string;
  nombre: string;
  modulo: string;
  accion: string;
}

export function GestionPermisosPanel() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsuario, setSelectedUsuario] = useState<number | null>(null);
  const [selectedPermiso, setSelectedPermiso] = useState<number | null>(null);
  const [razon, setRazon] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const usuariosCODAR = await rolesService.obtenerUsuariosPorRol('COMISIÓN_CODAR');
      const todosPermisos = await rolesService.obtenerTodosPermisos();
      setUsuarios(usuariosCODAR);
      setPermisos(todosPermisos);
    } catch (err) {
      setError('Error al cargar datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAsignarPermiso = async () => {
    if (!selectedUsuario || !selectedPermiso) {
      setError('Selecciona usuario y permiso');
      return;
    }

    try {
      setProcesando(true);
      const usuarioAdminId = localStorage.getItem('usuarioId') || '1';
      
      await rolesService.asignarPermiso(
        selectedUsuario,
        selectedPermiso,
        parseInt(usuarioAdminId),
        razon || 'Asignación de permiso'
      );

      // Limpiar
      setSelectedUsuario(null);
      setSelectedPermiso(null);
      setRazon('');
      
      // Recargar
      await cargarDatos();
    } catch (err) {
      setError('Error al asignar permiso');
      console.error(err);
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Permisos Dinámicos</CardTitle>
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
        <CardTitle>Gestión de Permisos Dinámicos</CardTitle>
        <CardDescription>Asigna permisos específicos a usuarios</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-red-100 p-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          {/* Selector de Usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Usuario:</label>
            <select
              value={selectedUsuario || ''}
              onChange={(e) => setSelectedUsuario(parseInt(e.target.value))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un usuario...</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} {u.apellido} ({u.dni})
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Permiso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permiso:</label>
            <select
              value={selectedPermiso || ''}
              onChange={(e) => setSelectedPermiso(parseInt(e.target.value))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un permiso...</option>
              {permisos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.modulo}/{p.accion})
                </option>
              ))}
            </select>
          </div>

          {/* Razón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Razón:</label>
            <textarea
              value={razon}
              onChange={(e) => setRazon(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="¿Por qué asignas este permiso?"
              rows={3}
            />
          </div>

          {/* Botón Asignar */}
          <Button
            onClick={handleAsignarPermiso}
            disabled={procesando || !selectedUsuario || !selectedPermiso}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {procesando ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Asignando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Asignar Permiso
              </>
            )}
          </Button>
        </div>

        {/* Lista de Permisos Activos */}
        {selectedUsuario && (
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Permisos Actuales del Usuario</h3>
            <div className="space-y-2">
              {permisos.slice(0, 5).map((p) => (
                <div key={p.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                  <div>
                    <p className="text-sm font-medium">{p.nombre}</p>
                    <p className="text-xs text-gray-600">{p.codigo}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
