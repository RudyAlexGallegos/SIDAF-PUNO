'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  FileText,
  AlertCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Shield,
  User,
  Calendar,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { rolesService } from '@/services/rolesService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type TipoCambio =
  | 'ASIGNACIÓN'
  | 'REVOCACIÓN'
  | 'CAMBIO_ESTADO'
  | 'CAMBIO_ROL'
  | 'SOLICITUD_APROBADA'
  | 'SOLICITUD_RECHAZADA'
  | 'USUARIO_APROBADO'
  | 'USUARIO_RECHAZADA'
  | string;

interface UsuarioInfo {
  id: number;
  nombre: string;
  apellido: string;
  dni?: string;
}

interface PermisoInfo {
  id: number;
  codigo: string;
  nombre: string;
}

interface AuditoriaLog {
  id: number;
  tipoCambio: TipoCambio;
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
    dni?: string;
  };
  usuarioAfectado?: UsuarioInfo;
  permiso?: PermisoInfo;
  rolAnterior?: string;
  rolNuevo?: string;
  realizadoPor?: UsuarioInfo;
  descripcion: string;
  razon?: string;
  fechaCambio: string;
}

type SortKey = 'fechaCambio' | 'tipoCambio';
type SortDir = 'asc' | 'desc';

export default function AuditoriaPage() {
  const [auditoria, setAuditoria] = useState<AuditoriaLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [size, setSize] = useState(50);

  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroRealizadoPor, setFiltroRealizadoPor] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('fechaCambio');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const cargarAuditoria = async (pagina: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await rolesService.obtenerAuditoria(pagina, size);
      if (response && response.datos) {
        setAuditoria(response.datos as AuditoriaLog[]);
        setTotalElementos(response.totalElementos || 0);
      } else {
        setAuditoria([]);
        setTotalElementos(0);
      }
    } catch (err) {
      setError('Error al cargar auditoría');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAuditoria(0);
  }, []);

  const tiposUnicos = useMemo(() => {
    const tipos = new Set<string>();
    auditoria.forEach((log) => tipos.add(log.tipoCambio));
    return Array.from(tipos).sort();
  }, [auditoria]);

  const totalPaginas = Math.max(1, Math.ceil(totalElementos / size));

  const datosFiltrados = useMemo(() => {
    const texto = filtroBusqueda.toLowerCase().trim();
    const desde = filtroFechaDesde ? new Date(filtroFechaDesde) : null;
    const hasta = filtroFechaHasta ? new Date(filtroFechaHasta + 'T23:59:59') : null;

    const parseDate = (s: string | undefined): Date | null => {
      if (!s) return null;
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    };

    let results = auditoria.filter((log) => {
      if (filtroTipo && log.tipoCambio !== filtroTipo) return false;

      const desdeFilter = parseDate(
        (log as any).fechaCambio || undefined,
      );
      if (desde) {
        const logDate = desdeFilter;
        if (!logDate || logDate < desde) return false;
      }
      if (hasta) {
        const logDate = parseDate((log as any).fechaCambio || undefined);
        if (!logDate || logDate > hasta) return false;
      }

      if (filtroUsuario) {
        const nombreCompleto =
          `${log.usuarioAfectado?.nombre || ''} ${log.usuarioAfectado?.apellido || ''}`.trim().toLowerCase();
        const dni = (log.usuarioAfectado?.dni || '').toLowerCase();
        if (
          !nombreCompleto.includes(filtroUsuario.toLowerCase()) &&
          !dni.includes(filtroUsuario.toLowerCase())
        )
          return false;
      }

      if (filtroRealizadoPor) {
        const nombreCompleto = `${log.realizadoPor?.nombre || ''} ${log.realizadoPor?.apellido || ''}`.trim().toLowerCase();
        if (!nombreCompleto.includes(filtroRealizadoPor.toLowerCase())) return false;
      }

      if (texto) {
        const relacionado = [
          log.tipoCambio,
          log.descripcion,
          log.razon,
          log.permiso?.nombre || '',
          log.permiso?.codigo || '',
          log.rolAnterior || '',
          log.rolNuevo || '',
          log.usuarioAfectado?.nombre || '',
          log.usuarioAfectado?.apellido || '',
          log.usuarioAfectado?.dni || '',
          log.realizadoPor?.nombre || '',
          log.realizadoPor?.apellido || '',
        ]
          .join(' ')
          .toLowerCase();

        if (!relacionado.includes(texto)) return false;
      }

      return true;
    });

    results = [...results].sort((a, b) => {
      let av: any = (a as any)[sortKey];
      let bv: any = (b as any)[sortKey];

      if (sortKey === 'fechaCambio') {
        av = av ? new Date(av).getTime() : 0;
        bv = bv ? new Date(bv).getTime() : 0;
      } else {
        av = (av || '').toString().toLowerCase();
        bv = (bv || '').toString().toLowerCase();
        av = av.localeCompare(bv, 'es');
        bv = 0;
      }

      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return results;
  }, [
    auditoria,
    filtroTipo,
    filtroBusqueda,
    filtroUsuario,
    filtroRealizadoPor,
    filtroFechaDesde,
    filtroFechaHasta,
    sortKey,
    sortDir,
  ]);

  const estadisticas = useMemo(() => {
    const stats: Record<string, number> = {};
    const usuarioSet = new Set<string>();
    const afectadoSet = new Set<string>();
    const hoy = new Date().toISOString().split('T')[0];
    let registrosHoy = 0;

    auditoria.forEach((log) => {
      stats[log.tipoCambio] = (stats[log.tipoCambio] || 0) + 1;
      if (log.realizadoPor?.id)
        usuarioSet.add(String(log.realizadoPor.id));
      if (log.usuarioAfectado?.id)
        afectadoSet.add(String(log.usuarioAfectado.id));
      if ((log.fechaCambio || '').startsWith(hoy)) registrosHoy++;
    });

    return {
      ...stats,
      total: auditoria.length,
      usuariosActivos: usuarioSet.size,
      usuariosAfectados: afectadoSet.size,
      registrosHoy,
    };
  }, [auditoria]);

  const limpiarFiltros = () => {
    setFiltroTipo('');
    setFiltroBusqueda('');
    setFiltroUsuario('');
    setFiltroRealizadoPor('');
    setFiltroFechaDesde('');
    setFiltroFechaHasta('');
    setSortKey('fechaCambio');
    setSortDir('desc');
    setPage(0);
  };

  const exportarExcel = () => {
    const datosParaExportar = datosFiltrados.map((log) => ({
      ID: log.id,
      Tipo: log.tipoCambio,
      'Usuario Afectado': log.usuarioAfectado
        ? `${log.usuarioAfectado.nombre} ${log.usuarioAfectado.apellido}`
        : '-',
      DNI_Afectado: log.usuarioAfectado?.dni || '-',
      'Permiso / Rol': log.permiso
        ? `${log.permiso.nombre} (${log.permiso.codigo})`
        : log.rolAnterior || log.rolNuevo || '-',
      'Rol Anterior': log.rolAnterior || '-',
      'Rol Nuevo': log.rolNuevo || '-',
      'Realizado Por': log.realizadoPor
        ? `${log.realizadoPor.nombre} ${log.realizadoPor.apellido}`
        : '-',
      Razón: log.razon || '-',
      Descripción: log.descripcion || '-',
      'Fecha y Hora': log.fechaCambio
        ? new Date(log.fechaCambio).toLocaleString('es-PE')
        : '-',
    }));

    const ws = XLSX.utils.json_to_sheet(datosParaExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Auditoría');
    XLSX.writeFile(wb, `auditoria_sidaf_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Reporte de Auditoría - SIDAF PUNO', 14, 14);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, 14, 20);
    doc.text(`Total registros mostrados: ${datosFiltrados.length}`, 14, 25);

    const head = [
      'ID',
      'Tipo',
      'Usuario Afectado',
      'Permiso/Rol',
      'Realizado Por',
      'Razón',
      'Fecha',
    ];

    const body = datosFiltrados.map((log) => [
      String(log.id),
      log.tipoCambio,
      log.usuarioAfectado
        ? `${log.usuarioAfectado.nombre} ${log.usuarioAfectado.apellido}`
        : '-',
      log.permiso
        ? `${log.permiso.nombre}`
        : log.rolAnterior || log.rolNuevo || '-',
      log.realizadoPor
        ? `${log.realizadoPor.nombre} ${log.realizadoPor.apellido}`
        : '-',
      (log.razon || '-').substring(0, 40),
      log.fechaCambio
        ? new Date(log.fechaCambio).toLocaleString('es-PE')
        : '-',
    ]);

    autoTable(doc, {
      head: [head],
      body,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1 },
      headStyles: { fontSize: 7, fillColor: [30, 58, 138] },
    });

    doc.save(`auditoria_sidaf_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getTipoConfig = (tipo: TipoCambio) => {
    switch (tipo) {
      case 'ASIGNACIÓN':
        return {
          label: 'Asignación',
          color: 'bg-blue-100 text-blue-800',
          border: 'border-blue-200',
          icon: Shield,
        };
      case 'REVOCACIÓN':
        return {
          label: 'Revocación',
          color: 'bg-red-100 text-red-800',
          border: 'border-red-200',
          icon: AlertCircle,
        };
      case 'CAMBIO_ESTADO':
        return {
          label: 'Cambio Estado',
          color: 'bg-amber-100 text-amber-800',
          border: 'border-amber-200',
          icon: User,
        };
      case 'CAMBIO_ROL':
        return {
          label: 'Cambio Rol',
          color: 'bg-purple-100 text-purple-800',
          border: 'border-purple-200',
          icon: Shield,
        };
      case 'USUARIO_APROBADO':
        return {
          label: 'Aprobado',
          color: 'bg-emerald-100 text-emerald-800',
          border: 'border-emerald-200',
          icon: User,
        };
      case 'USUARIO_RECHAZADO':
        return {
          label: 'Rechazado',
          color: 'bg-red-100 text-red-800',
          border: 'border-red-200',
          icon: AlertCircle,
        };
      case 'SOLICITUD_APROBADA':
        return {
          label: 'Solicitud Aprobada',
          color: 'bg-green-100 text-green-800',
          border: 'border-green-200',
          icon: FileText,
        };
      case 'SOLICITUD_RECHAZADA':
        return {
          label: 'Solicitud Rechazada',
          color: 'bg-red-100 text-red-800',
          border: 'border-red-200',
          icon: AlertCircle,
        };
      default:
        return {
          label: tipo,
          color: 'bg-gray-100 text-gray-800',
          border: 'border-gray-200',
          icon: FileText,
        };
    }
  };

  const StatCard = ({
    label,
    value,
    subValue,
    icon: Icon,
    color = 'blue',
  }: {
    label: string;
    value: number | string;
    subValue?: string;
    icon: any;
    color?: 'blue' | 'indigo' | 'emerald' | 'amber' | 'purple' | 'red';
  }) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600 border-blue-100',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      amber: 'bg-amber-50 text-amber-600 border-amber-100',
      purple: 'bg-purple-50 text-purple-600 border-purple-100',
      red: 'bg-red-50 text-red-600 border-red-100',
    };

    return (
      <div className={`rounded-xl border ${colorMap[color]} p-3 md:p-4`}>
        <div className="flex items-center gap-2">
          <div
            className={`h-8 w-8 md:h-9 md:w-9 rounded-lg ${colorMap[color].split(' ')[0]} flex items-center justify-center`}
          >
            <Icon className={`h-4 md:h-5 w-4 md:w-5 ${colorMap[color].split(' ')[1]}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm text-slate-500">{label}</p>
            <p className="text-lg md:text-2xl font-bold text-slate-900">{value}</p>
            {subValue && (
              <p className="text-xs text-slate-500 truncate">{subValue}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading && page === 0) {
    return (
      <div className="space-y-4 md:space-y-6">
        <section className="border-b pb-3 md:pb-4">
          <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
            Comisión Departamental de Árbitros · Puno
          </p>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">
            Auditoría del Sistema
          </h1>
          <p className="text-slate-500 mt-2 max-w-3xl text-xs md:text-sm lg:text-base">
            Registro histórico completo de eventos del sistema. Esta información es usada para
            análisis predictivo y entrenamiento de modelos inteligentes.
          </p>
        </section>
        <Card>
          <CardContent className="flex justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="text-slate-500 text-sm">
                Cargando datos de auditoría...
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      {/* Header */}
      <section className="border-b pb-3 md:pb-4 lg:pb-6">
        <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
          Comisión Departamental de Árbitros · Puno
        </p>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mt-2">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900">
              Auditoría del Sistema
            </h1>
            <p className="text-slate-500 mt-1 max-w-3xl text-xs md:text-sm lg:text-base">
              Registro histórico completo de eventos del sistema. Esta información es usada para
              análisis predictivo y entrenamiento de modelos inteligentes de designaciones.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => cargarAuditoria(0)}
              disabled={loading}
              className="h-8 text-xs"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`}
              />
              Recargar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 text-xs"
            >
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              {showFilters ? 'Ocultar Filtros' : 'Filtros'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportarExcel}
              disabled={datosFiltrados.length === 0}
              className="h-8 text-xs"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportarPDF}
              disabled={datosFiltrados.length === 0}
              className="h-8 text-xs"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              PDF
            </Button>
          </div>
        </div>
      </section>

      {/* Error State */}
      {error && !loading && (
        <Card className="border-red-200 bg-red-50/60">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-800 text-sm">Error al cargar datos</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
              <button
                onClick={() => cargarAuditoria(page)}
                className="mt-2 px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      {!loading && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
          <StatCard
            label="Total Registros"
            value={estadisticas.total}
            subValue={`${estadisticas.registrosHoy} registrados hoy`}
            icon={FileText}
            color="blue"
          />
          <StatCard
            label="Usuarios Afectados"
            value={estadisticas.usuariosAfectados}
            subValue="Personas impactadas"
            icon={User}
            color="amber"
          />
          <StatCard
            label="Administradores Activos"
            value={estadisticas.usuariosActivos}
            subValue="Operadores del sistema"
            icon={Shield}
            color="purple"
          />
          <StatCard
            label="Registros Hoy"
            value={estadisticas.registrosHoy}
            subValue="Actividad del día"
            icon={Calendar}
            color="emerald"
          />
        </section>
      )}

      {/* Type distribution strip */}
      {!loading && (
        <section className="flex flex-wrap gap-2">
          {Object.entries(estadisticas).map(([tipo, cantidad]) => {
            if (['total', 'usuariosActivos', 'usuariosAfectados', 'registrosHoy'].includes(tipo))
              return null;
            const config = getTipoConfig(tipo);
            return (
              <div
                key={tipo}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${config.border} ${config.color}`}
              >
                <config.icon className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">{config.label}</span>
                <span className="text-xs font-bold ml-1">{cantidad as number}</span>
              </div>
            );
          })}
        </section>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filtros de Búsqueda</CardTitle>
            <CardDescription>Refine la consulta por tipo, fecha, usuario o texto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs font-medium text-slate-600">Tipo de Cambio</Label>
                <select
                  value={filtroTipo}
                  onChange={(e) => {
                    setFiltroTipo(e.target.value);
                    setPage(0);
                  }}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {tiposUnicos.map((t) => (
                    <option key={t} value={t}>
                      {getTipoConfig(t).label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-medium text-slate-600">Usuario Afectado</Label>
                <Input
                  value={filtroUsuario}
                  onChange={(e) => {
                    setFiltroUsuario(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Nombre o DNI"
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-slate-600">Realizado Por</Label>
                <Input
                  value={filtroRealizadoPor}
                  onChange={(e) => {
                    setFiltroRealizadoPor(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Nombre del operador"
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-slate-600">Búsqueda general</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                  <Input
                    value={filtroBusqueda}
                    onChange={(e) => {
                      setFiltroBusqueda(e.target.value);
                      setPage(0);
                    }}
                    placeholder="Buscar en toda la auditoría..."
                    className="pl-8 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-slate-600">Fecha desde</Label>
                <Input
                  type="date"
                  value={filtroFechaDesde}
                  onChange={(e) => {
                    setFiltroFechaDesde(e.target.value);
                    setPage(0);
                  }}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-slate-600">Fecha hasta</Label>
                <Input
                  type="date"
                  value={filtroFechaHasta}
                  onChange={(e) => {
                    setFiltroFechaHasta(e.target.value);
                    setPage(0);
                  }}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={limpiarFiltros}
                className="h-8 text-xs"
              >
                Limpiar filtros
              </Button>
              <span className="text-xs text-slate-500">
                Mostrando {datosFiltrados.length} de {totalElementos} registros
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registro de Eventos</CardTitle>
          <CardDescription>
            Historial completo de cambios con {totalElementos} eventos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th
                    className="text-left px-2 md:px-4 py-2 md:py-3 font-semibold text-slate-700 cursor-pointer select-none"
                    onClick={() => {
                      if (sortKey === 'tipoCambio') {
                        setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortKey('tipoCambio');
                        setSortDir('asc');
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Tipo
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th className="text-left px-2 md:px-4 py-2 md:py-3 font-semibold text-slate-700">
                    Usuario Afectado
                  </th>
                  <th className="text-left px-2 md:px-4 py-2 md:py-3 font-semibold text-slate-700">
                    Permiso / Rol
                  </th>
                  <th className="text-left px-2 md:px-4 py-2 md:py-3 font-semibold text-slate-700">
                    Realizado Por
                  </th>
                  <th className="text-left px-2 md:px-4 py-2 md:py-3 font-semibold text-slate-700 hidden md:table-cell">
                    Razón
                  </th>
                  <th
                    className="text-left px-2 md:px-4 py-2 md:py-3 font-semibold text-slate-700 cursor-pointer select-none"
                    onClick={() => {
                      if (sortKey === 'fechaCambio') {
                        setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortKey('fechaCambio');
                        setSortDir('desc');
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Fecha
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {datosFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-10 text-slate-500"
                    >
                      <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
                      <p className="font-medium">Sin resultados</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Prueba modificando los filtros de búsqueda
                      </p>
                    </td>
                  </tr>
                ) : (
                  datosFiltrados.map((log) => {
                    const config = getTipoConfig(log.tipoCambio);
                    const Icon = config.icon;
                    return (
                      <tr
                        key={log.id}
                        className="border-b hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-2 md:px-4 py-2 md:py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border ${config.color} ${config.border}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-2 md:px-4 py-2 md:py-3">
                          {log.usuarioAfectado ? (
                            <div>
                              <p className="font-medium text-slate-900 truncate">
                                {log.usuarioAfectado.nombre} {log.usuarioAfectado.apellido}
                              </p>
                              {log.usuarioAfectado.dni && (
                                <p className="text-xs text-slate-500">
                                  DNI: {log.usuarioAfectado.dni}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-2 md:px-4 py-2 md:py-3">
                          {log.permiso ? (
                            <div>
                              <p className="font-medium text-slate-900 truncate">
                                {log.permiso.nombre}
                              </p>
                              <p className="text-xs text-slate-500">{log.permiso.codigo}</p>
                            </div>
                          ) : log.rolAnterior || log.rolNuevo ? (
                            <div>
                              <p className="text-xs text-slate-700">
                                {log.rolAnterior && <span className="line-through mr-1">{log.rolAnterior}</span>}
                                {log.rolNuevo && (
                                  <span className="font-semibold ml-1">{log.rolNuevo}</span>
                                )}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-2 md:px-4 py-2 md:py-3">
                          {log.realizadoPor ? (
                            <div>
                              <p className="font-medium text-slate-900 truncate">
                                {log.realizadoPor.nombre} {log.realizadoPor.apellido}
                              </p>
                              <p className="text-xs text-slate-500">
                                ID: {log.realizadoPor.id}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-2 md:px-4 py-2 md:py-3 text-slate-600 max-w-xs hidden md:table-cell">
                          <span className="truncate block" title={log.razon || '-'}>
                            {log.razon || '-'}
                          </span>
                        </td>
                        <td className="px-2 md:px-4 py-2 md:py-3 text-slate-500 whitespace-nowrap">
                          {log.fechaCambio
                            ? new Date(log.fechaCambio).toLocaleString('es-PE', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>Mostrando página {page + 1} de {totalPaginas}</span>
                <span className="text-slate-400">·</span>
                <span>{totalElementos} registros en total</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPage((p) => Math.max(0, p - 1));
                    cargarAuditoria(Math.max(0, page - 1));
                  }}
                  disabled={page === 0 || loading}
                  className="h-8 text-xs"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-md text-sm font-medium text-blue-800">
                  {page + 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPage((p) => p + 1);
                    cargarAuditoria(page + 1);
                  }}
                  disabled={page >= totalPaginas - 1 || loading}
                  className="h-8 text-xs"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
