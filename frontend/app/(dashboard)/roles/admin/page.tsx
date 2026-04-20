'use client';

import { UsuariosPendientesPanel } from '@/components/roles/UsuariosPendientesPanel';
import { GestionPermisosPanel } from '@/components/roles/GestionPermisosPanel';
import { DashboardAuditoria } from '@/components/roles/DashboardAuditoria';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
        <p className="text-gray-600 mt-2">
          Gestión completa del sistema de roles y permisos
        </p>
      </div>

      <Tabs defaultValue="usuarios" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="permisos">Permisos</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoría</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-4">
          <UsuariosPendientesPanel />
        </TabsContent>

        <TabsContent value="permisos" className="space-y-4">
          <GestionPermisosPanel />
        </TabsContent>

        <TabsContent value="auditoria" className="space-y-4">
          <DashboardAuditoria />
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Panel Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">∞</p>
            <p className="text-xs text-gray-600">Acceso Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Seguridad</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">✓</p>
            <p className="text-xs text-gray-600">Auditado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">Online</p>
            <p className="text-xs text-gray-600">Operativo</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
