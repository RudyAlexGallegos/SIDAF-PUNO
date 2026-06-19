'use client';

import { useState } from 'react';
import { rolesService } from '@/services/rolesService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const PERMISOS_DISPONIBLES = [
  { codigo: 'VER_ARBITROS', nombre: 'Ver Árbitros', modulo: 'Árbitros' },
  { codigo: 'GESTION_ARBITROS', nombre: 'Gestionar Árbitros', modulo: 'Árbitros' },
  { codigo: 'GESTION_ASISTENCIA', nombre: 'Gestionar Asistencia', modulo: 'Asistencia' },
  { codigo: 'GESTION_DESIGNACIONES', nombre: 'Gestionar Designaciones', modulo: 'Designaciones' },
  { codigo: 'GESTION_CAMPEONATOS', nombre: 'Gestionar Campeonatos', modulo: 'Campeonatos' },
  { codigo: 'GESTION_EQUIPOS', nombre: 'Gestionar Equipos', modulo: 'Equipos' },
  { codigo: 'VER_REPORTES', nombre: 'Ver Reportes', modulo: 'Reportes' },
  { codigo: 'VER_USUARIOS', nombre: 'Ver Usuarios', modulo: 'Usuarios' },
];

export default function SolicitarPermisoPage() {
  const [permiso, setPermiso] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!permiso) {
      setError('Debes seleccionar un permiso');
      return;
    }

    setLoading(true);

    try {
      await rolesService.crearSolicitudPermiso(permiso);
      setSuccess(true);
      setPermiso('');
      setDescripcion('');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Solicitar Permiso</h1>
        <p className="text-gray-600 mt-2">
          Solicita permisos adicionales para acceder a módulos del sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nueva Solicitud</CardTitle>
          <CardDescription>
            Completa el formulario para solicitar acceso a un módulo específico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="permiso">Permiso Solicitado *</Label>
              <Select value={permiso} onValueChange={setPermiso}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un permiso" />
                </SelectTrigger>
                <SelectContent>
                  {PERMISOS_DISPONIBLES.map((p) => (
                    <SelectItem key={p.codigo} value={p.codigo}>
                      {p.nombre} <span className="text-gray-400 text-xs ml-2">({p.modulo})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Motivo / Justificación</Label>
              <Input
                id="descripcion"
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Explica por qué necesitas este permiso"
                maxLength={200}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <CheckCircle className="h-4 w-4 mt-0.5" />
                <span>Solicitud enviada exitosamente. La Presidencia la revisará pronto.</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </span>
              ) : (
                'Enviar Solicitud'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permisos Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PERMISOS_DISPONIBLES.map((p) => (
              <div key={p.codigo} className="flex items-center gap-2 p-2 rounded bg-gray-50">
                <span className="text-sm font-medium">{p.nombre}</span>
                <span className="text-xs text-gray-400 ml-auto">{p.modulo}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
