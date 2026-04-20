'use client';

import { useState, useEffect } from 'react';
import { rolesService } from '@/services/rolesService';
import Link from 'next/link';
import { 
  Users, 
  Key, 
  FileText, 
  BarChart3, 
  Settings, 
  Loader2,
  Zap,
  ChevronRight,
  LucideIcon
} from 'lucide-react';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  requiredPermiso?: string;
  visible: boolean;
  badge?: string;
  color?: 'blue' | 'purple' | 'indigo' | 'emerald' | 'amber';
}

export function MenuDinamico() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);

  useEffect(() => {
    cargarMenu();
  }, []);

  const cargarMenu = async () => {
    try {
      const usuarioIdStored = localStorage.getItem('usuarioId');
      if (!usuarioIdStored) {
        setLoading(false);
        return;
      }

      const id = parseInt(usuarioIdStored);
      setUsuarioId(id);

      // Obtener info del usuario
      const infoUsuario = await rolesService.obtenerInfoUsuario(id);
      const rolNombre = infoUsuario.datos?.rol?.nombre || '';

      // Construir menú basado en permisos
      const menuBasico: MenuItem[] = [];

      // Ítems para todos
      menuBasico.push({
        icon: Users,
        label: 'Mi Perfil',
        href: '/roles/perfil',
        visible: true,
        color: 'blue'
      });

      // Ítems si es PRESIDENCIA
      if (rolNombre === 'PRESIDENCIA') {
        menuBasico.push({
          icon: Users,
          label: 'Usuarios Pendientes',
          href: '/roles/usuarios-pendientes',
          visible: true,
          badge: 'Nuevo',
          color: 'amber'
        });

        menuBasico.push({
          icon: FileText,
          label: 'Solicitudes',
          href: '/roles/solicitudes',
          visible: true,
          color: 'purple'
        });

        menuBasico.push({
          icon: Key,
          label: 'Asignar Permisos',
          href: '/roles/permisos',
          visible: true,
          color: 'indigo'
        });
      }

      // Ítems si es ADMINISTRADOR
      if (rolNombre === 'ADMIN') {
        menuBasico.push({
          icon: Settings,
          label: 'Gestión de Usuarios',
          href: '/roles/usuarios',
          visible: true,
          color: 'emerald'
        });

        menuBasico.push({
          icon: Key,
          label: 'Gestión de Permisos',
          href: '/roles/permisos',
          visible: true,
          color: 'indigo'
        });

        menuBasico.push({
          icon: BarChart3,
          label: 'Auditoría',
          href: '/roles/auditoria',
          visible: true,
          color: 'purple'
        });

        menuBasico.push({
          icon: Zap,
          label: 'Panel Admin',
          href: '/roles/admin',
          visible: true,
          badge: 'Pro',
          color: 'amber'
        });
      }

      setMenuItems(menuBasico);
    } catch (err) {
      console.error('Error cargando menú:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const colorClasses: Record<string, string> = {
    blue: 'hover:bg-blue-500/10 text-blue-400 hover:text-blue-300',
    purple: 'hover:bg-purple-500/10 text-purple-400 hover:text-purple-300',
    indigo: 'hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300',
    emerald: 'hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300',
    amber: 'hover:bg-amber-500/10 text-amber-400 hover:text-amber-300'
  };

  const badgeColors: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-300',
    purple: 'bg-purple-500/20 text-purple-300',
    indigo: 'bg-indigo-500/20 text-indigo-300',
    emerald: 'bg-emerald-500/20 text-emerald-300',
    amber: 'bg-amber-500/20 text-amber-300'
  };

  return (
    <nav className="space-y-2">
      {menuItems
        .filter((item) => item.visible)
        .map((item, index) => {
          const Icon = item.icon;
          const colorClass = colorClasses[item.color || 'blue'];
          const badgeColor = badgeColors[item.color || 'blue'];
          
          return (
            <Link
              key={index}
              href={item.href}
              className={`
                flex items-center justify-between px-4 py-3 rounded-lg
                transition-all duration-200 group
                hover:translate-x-1
                ${colorClass}
                border border-slate-700/0 hover:border-slate-700/50
              `}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColor}`}>
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          );
        })}
    </nav>
  );
}
