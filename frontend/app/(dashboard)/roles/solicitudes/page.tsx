'use client';

import { SolicitudesPermisosPanel } from '@/components/roles/SolicitudesPermisosPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SolicitudesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Solicitudes de Permisos</h1>
        <p className="text-gray-600 mt-2">
          Revisa y aprueba las solicitudes de permisos adicionales de los usuarios
        </p>
      </div>

      <SolicitudesPermisosPanel />

      <Card>
        <CardHeader>
          <CardTitle>Tipos de Permisos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>VER:</strong>
              <p className="text-gray-600">Acceso de lectura</p>
            </div>
            <div>
              <strong>CREAR:</strong>
              <p className="text-gray-600">Crear nuevos registros</p>
            </div>
            <div>
              <strong>EDITAR:</strong>
              <p className="text-gray-600">Modificar existentes</p>
            </div>
            <div>
              <strong>ELIMINAR:</strong>
              <p className="text-gray-600">Borrar registros</p>
            </div>
            <div>
              <strong>EXPORTAR:</strong>
              <p className="text-gray-600">Descargar datos</p>
            </div>
            <div>
              <strong>REGISTRAR:</strong>
              <p className="text-gray-600">Entrada (ej: asistencia)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
