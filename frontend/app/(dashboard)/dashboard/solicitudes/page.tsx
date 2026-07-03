'use client';

import { SolicitudesPermisosPanel } from '@/components/roles/SolicitudesPermisosPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
          <CardTitle>Tipos de Permisos Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>VER_ARBITROS:</strong>
              <p className="text-gray-600">Ver información de árbitros</p>
            </div>
            <div>
              <strong>GESTION_ARBITROS:</strong>
              <p className="text-gray-600">Crear, editar y eliminar árbitros</p>
            </div>
            <div>
              <strong>GESTION_ASISTENCIA:</strong>
              <p className="text-gray-600">Registrar y modificar asistencias</p>
            </div>
            <div>
              <strong>GESTION_DESIGNACIONES:</strong>
              <p className="text-gray-600">Crear y asignar designaciones</p>
            </div>
            <div>
              <strong>GESTION_CAMPEONATOS:</strong>
              <p className="text-gray-600">Administrar campeonatos</p>
            </div>
            <div>
              <strong>GESTION_EQUIPOS:</strong>
              <p className="text-gray-600">Gestionar equipos</p>
            </div>
            <div>
              <strong>VER_REPORTES:</strong>
              <p className="text-gray-600">Acceder a reportes y estadísticas</p>
            </div>
            <div>
              <strong>VER_USUARIOS:</strong>
              <p className="text-gray-600">Ver lista de usuarios</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
