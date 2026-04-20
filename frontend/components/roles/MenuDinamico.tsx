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
  Zap
} from 'lucide-react';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  requiredPermiso?: string;
  visible: boolean;
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
        icon: <Users className="h-5 w-5" />,
        label: 'Mi Perfil',
        href: '/roles/perfil',
        visible: true,
      });

      // Ítems si es PRESIDENCIA
      if (rolNombre === 'PRESIDENCIA') {
        menuBasico.push({
          icon: <Users className="h-5 w-5" />,
          label: 'Usuarios Pendientes',
          href: '/roles/usuarios-pendientes',
          visible: true,
        });

        menuBasico.push({
          icon: <FileText className="h-5 w-5" />,
          label: 'Solicitudes',
          href: '/roles/solicitudes',
          visible: true,
        });

        menuBasico.push({
          icon: <Key className="h-5 w-5" />,
          label: 'Asignar Permisos',
          href: '/roles/permisos',
          visible: true,
        });
      }

      // Ítems si es ADMINISTRADOR
      if (rolNombre === 'ADMIN') {
        menuBasico.push({
          icon: <Settings className="h-5 w-5" />,
          label: 'Gestión de Usuarios',
          href: '/roles/usuarios',
          visible: true,
        });

        menuBasico.push({
          icon: <Key className="h-5 w-5" />,
          label: 'Gestión de Permisos',
          href: '/roles/permisos',
          visible: true,
        });

        menuBasico.push({
          icon: <BarChart3 className="h-5 w-5" />,
          label: 'Auditoría',
          href: '/roles/auditoria',
          visible: true,
        });

        menuBasico.push({
          icon: <Zap className="h-5 w-5" />,
          label: 'Panel Admin',
          href: '/roles/admin',
          visible: true,
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
    return <Loader2 className="h-5 w-5 animate-spin" />;
  }

  return (
    <nav className="space-y-2">
      {menuItems
        .filter((item) => item.visible)
        .map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
    </nav>
  );
}
