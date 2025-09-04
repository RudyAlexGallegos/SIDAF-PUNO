// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Calendar, Plus, Trophy, UserCheck, Users, BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'SIDAF PUNO',
  description: 'Sistema de gestión de árbitros y campeonatos',
  generator: 'v0.dev',
}

// Helper para obtener pathname (usado más abajo como hook)
// Esto solo funciona en componentes cliente.
function NavLink({ href, icon: Icon, name }: { href: string, icon: any, name: string }) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 text-sm p-2 rounded-lg transition-all duration-200 ${
        isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{name}</span>
    </Link>
  )
}

const menuItems = [
  {
    title: "Gestión de Árbitros",
    items: [
      { name: "Ver Árbitros", href: "/arbitros", icon: Users },
      { name: "Nuevo Árbitro", href: "/arbitros/nuevo", icon: Plus },
    ],
  },
  {
    title: "Asistencia",
    items: [
      { name: "Pasar Asistencia", href: "/asistencia", icon: UserCheck },
      { name: "Estadísticas", href: "/asistencia/estadisticas", icon: BarChart3 },
    ],
  },
  {
    title: "Designaciones",
    items: [
      { name: "Nueva Designación", href: "/designaciones/nueva", icon: Plus },
      { name: "Ver Designaciones", href: "/designaciones", icon: Calendar },
    ],
  },
  {
    title: "Campeonatos",
    items: [
      { name: "Campeonatos", href: "/campeonatos", icon: Trophy },
      { name: "Reportes PDF", href: "/reportes", icon: FileText },
    ],
  },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <div className="flex min-h-screen bg-slate-50">
          {/* Menú lateral */}
          <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
            <div className="flex items-center px-6 py-4 space-x-3 border-b border-slate-200">
              <img src="/images.jpeg" alt="Logo SIDAF PUNO" className="h-10 w-10 rounded-xl object-cover" />
              <div>
                <h1 className="text-lg font-bold text-slate-900">SIDAF PUNO</h1>
                <p className="text-xs text-slate-600">Comisión Departamental de Árbitros</p>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-4">
              {menuItems.map((section) => (
                <div key={section.title}>
                  <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide mb-2">{section.title}</p>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <NavLink key={item.name} href={item.href} icon={item.icon} name={item.name} />
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-200">
              <button className="flex items-center space-x-3 text-sm text-slate-700 hover:bg-slate-100 p-2 rounded-lg w-full transition-all duration-200">
                <FileText className="h-4 w-4" />
                <span>Reglamentos</span>
              </button>
            </div>
            <div className="p-4 border-t border-slate-200">
              <button className="flex items-center space-x-3 text-sm text-slate-700 hover:bg-slate-100 p-2 rounded-lg w-full transition-all duration-200">
                <FileText className="h-4 w-4" />
                <span>Evaluación</span>
              </button>
            </div>
          </aside>

          {/* Contenido dinámico */}
          <main className="flex-1 px-6 py-12 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
