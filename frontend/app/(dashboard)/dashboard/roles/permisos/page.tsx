'use client';

import { GestionPermisosPanel } from '@/components/roles/GestionPermisosPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GestionPermisosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Permisos</h1>
        <p className="text-gray-600 mt-2">
          Asigna permisos dinámicos a usuarios según sus necesidades
        </p>
      </div>

      <GestionPermisosPanel />

      <Card>
        <CardHeader>
          <CardTitle>¿Cómo funciona?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>1. Selecciona Usuario:</strong>
              <p className="text-gray-600 ml-2">Elige el usuario al que deseas asignar permisos</p>
            </div>
            <div>
              <strong>2. Elige Permiso:</strong>
              <p className="text-gray-600 ml-2">Selecciona el permiso específico que necesita</p>
            </div>
            <div>
              <strong>3. Documenta:</strong>
              <p className="text-gray-600 ml-2">Escribe la razón de la asignación para auditoría</p>
            </div>
            <div>
              <strong>4. Confirma:</strong>
              <p className="text-gray-600 ml-2">El sistema registrará el cambio automáticamente</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
