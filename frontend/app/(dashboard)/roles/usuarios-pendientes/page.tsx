'use client';

import { UsuariosPendientesPanel } from '@/components/roles/UsuariosPendientesPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UsuariosPendientesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Aprobar Usuarios</h1>
        <p className="text-gray-600 mt-2">
          Revisa y aprueba los usuarios nuevos que solicitaron acceso al sistema
        </p>
      </div>

      <UsuariosPendientesPanel />

      <Card>
        <CardHeader>
          <CardTitle>Información</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Estado PENDIENTE:</strong> El usuario ha creado su cuenta pero aún no ha sido aprobado por PRESIDENCIA o ADMIN.
            </p>
            <p>
              <strong>Al Aprobar:</strong> El usuario tendrá acceso al sistema con el rol UNIDAD_TÉCNICA (PRESIDENCIA) o el rol que asignes (ADMIN).
            </p>
            <p>
              <strong>Al Rechazar:</strong> El usuario no podrá acceder al sistema y deberá contactar al administrador.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
