'use client';

import { DashboardAuditoria } from '@/components/roles/DashboardAuditoria';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuditoriaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Auditoría</h1>
        <p className="text-gray-600 mt-2">
          Registro completo de todos los cambios en el sistema
        </p>
      </div>

      <DashboardAuditoria />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Cambios</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li><strong>ASIGNACIÓN:</strong> Se asignó un permiso</li>
              <li><strong>REVOCACIÓN:</strong> Se revocó un permiso</li>
              <li><strong>CAMBIO_ROL:</strong> Se cambió el rol</li>
              <li><strong>CAMBIO_ESTADO:</strong> Se cambió el estado</li>
              <li><strong>USUARIO_APROBADO:</strong> Se aprobó usuario</li>
              <li><strong>USUARIO_RECHAZADO:</strong> Se rechazó usuario</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información Registrada</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li><strong>Quién:</strong> Usuario que hizo el cambio</li>
              <li><strong>Qué:</strong> Permiso/rol modificado</li>
              <li><strong>Cuándo:</strong> Fecha y hora exacta</li>
              <li><strong>Por qué:</strong> Razón documentada</li>
              <li><strong>Afectado:</strong> Usuario afectado</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
