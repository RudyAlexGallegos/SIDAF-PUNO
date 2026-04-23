"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    Home,
    FileText,
    Calendar,
    Trophy,
    UserCheck,
    Users,
    Menu,
    LucideIcon,
    LogOut,
    Shield,
    UserCog,
    Send,
    Inbox,
    User,
    History,
    Award,
} from "lucide-react"
import { getStoredUser } from "@/services/api"

/* =======================
   NAV LINK
  ======================= */

function NavLink({
    href,
    icon: Icon,
    name,
    showLabels,
    onClick,
}: {
    href: string
    icon: LucideIcon
    name: string
    showLabels?: boolean
    onClick?: () => void
}) {
    const pathname = usePathname()
    const isActive = pathname === href
    const router = useRouter()

    return (
        <Link
            href={href}
            onClick={() => {
                router.prefetch(href)
                onClick?.()
            }}
            onMouseEnter={() => router.prefetch(href)}
            className={`flex items-center gap-3 text-sm px-3 py-2 rounded-xl transition-all
        ${
            isActive
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
        }`}
        >
            <Icon className="h-5 w-5 shrink-0" />
            {showLabels && <span>{name}</span>}
        </Link>
    )
}

/* =======================
   TIPOS DE ROL
  ======================= */

type RolUsuario = "ADMIN" | "PRESIDENTE" | "ARBITRO"

interface Usuario {
    id?: number
    dni?: string
    nombre?: string
    apellido?: string
    email?: string
    telefono?: string
    cargoCodar?: string
    areaCodar?: string
    rol?: string
    estado?: string
    permisosEspecificos?: string  // JSON array of permissions
}

/* =======================
   MENÚ POR ROL Y PERMISOS
  ======================= */

// Mapeo de permisos a URLs del menú
const PERMISO_TO_HREF: Record<string, string> = {
    "VER_ARBITROS": "/dashboard/arbitros",
    "GESTION_ARBITROS": "/dashboard/arbitros",
    "GESTION_ASISTENCIA": "/dashboard/asistencia",
    "GESTION_ASISTENCIA_HISTORIAL": "/dashboard/asistencia/historial",
    "GESTION_DESIGNACIONES": "/dashboard/designaciones",
    "GESTION_CAMPEONATOS": "/dashboard/campeonatos",
    "GESTION_EQUIPOS": "/dashboard/campeonatos/equipos",
    "VER_REPORTES": "/dashboard/reportes",
}

function getMenuItems(
    rol?: string,
    permisosEspecificos?: string
): Array<{ title: string; items: Array<{ name: string; href: string; icon: LucideIcon }> }> {
    // Parsear permisos específicos
    let permisos: string[] = []
    if (permisosEspecificos) {
        try {
            permisos = JSON.parse(permisosEspecificos)
        } catch {
            permisos = []
        }
    }
    
    // ADMIN tiene acceso a todo
    const isAdmin = rol === "ADMIN"
    
    // Si tiene permiso "TODOS", tiene acceso completo
    const hasAllAccess = permisos.includes("TODOS")
    
    const menuPrincipal = [
        {
            title: "Principal",
            items: [
                { name: "Inicio", href: "/dashboard", icon: Home },
                { name: "Perfil", href: "/dashboard/perfil", icon: User },
            ],
        },
    ]
    
    // Si no es admin ni tiene acceso total, filtrar por permisos específicos
    if (!isAdmin && !hasAllAccess && permisos.length > 0) {
        const allowedHrefs = permisos
            .map(p => PERMISO_TO_HREF[p])
            .filter(Boolean)
        
        // Eliminar duplicados
        const uniqueHrefs = [...new Set(allowedHrefs)]
        
        // Construir menú basado en permisos
        const menuItems: Array<{ name: string; href: string; icon: LucideIcon }> = []
        
        if (uniqueHrefs.includes("/dashboard/arbitros")) {
            menuItems.push({ name: "Árbitros", href: "/dashboard/arbitros", icon: Users })
        }
        if (uniqueHrefs.includes("/dashboard/asistencia")) {
            menuItems.push({ name: "Control Asistencia", href: "/dashboard/asistencia", icon: UserCheck })
        }
        if (uniqueHrefs.includes("/dashboard/asistencia/historial")) {
            menuItems.push({ name: "Historial Asistencia", href: "/dashboard/asistencia/historial", icon: History })
        }
        if (uniqueHrefs.includes("/dashboard/designaciones")) {
            menuItems.push({ name: "Designaciones", href: "/dashboard/designaciones", icon: Calendar })
        }
        if (uniqueHrefs.includes("/dashboard/campeonatos")) {
            menuItems.push({ name: "Campeonatos", href: "/dashboard/campeonatos", icon: Trophy })
        }
        if (uniqueHrefs.includes("/dashboard/campeonatos/equipos")) {
            menuItems.push({ name: "Equipos", href: "/dashboard/campeonatos/equipos", icon: Shield })
        }
        if (uniqueHrefs.includes("/dashboard/reportes")) {
            menuItems.push({ name: "Reportes", href: "/dashboard/reportes", icon: FileText })
        }
        
        return [
            ...menuPrincipal,
            {
                title: "Permisos",
                items: [
                    { name: "Solicitar Permiso", href: "/dashboard/solicitar-permiso", icon: Send },
                    { name: "Ver Solicitudes", href: "/dashboard/solicitudes", icon: Inbox },
                ],
            },
            {
                title: "Gestión",
                items: menuItems,
            },
        ]
    }

    // ARBITRO: Solo puede ver asistencia
    if (rol === "ARBITRO") {
        return [
            ...menuPrincipal,
            {
                title: "Mi Gestión",
                items: [
                    {
                        name: "Mi Asistencia",
                        href: "/dashboard/asistencia",
                        icon: UserCheck,
                    },
                    {
                        name: "Historial Asistencia",
                        href: "/dashboard/asistencia/historial",
                        icon: History,
                    },
                    {
                        name: "Ranking Semanal",
                        href: "/dashboard/asistencia/ranking",
                        icon: Award,
                    },
                ],
            },
        ]
    }

    // PRESIDENCIA_CODAR: Puede gestionar solicitudes de permisos
    if (rol === "PRESIDENCIA_CODAR") {
        return [
            ...menuPrincipal,
            {
                title: "Presidencia",
                items: [
                    { name: "Solicitar Permiso", href: "/dashboard/solicitar-permiso", icon: Send },
                    { name: "Ver Solicitudes", href: "/dashboard/solicitudes", icon: Inbox },
                ],
            },
            {
                title: "Gestión",
                items: [
                    { name: "Árbitros", href: "/dashboard/arbitros", icon: Users },
                    { name: "Usuarios", href: "/dashboard/usuarios", icon: UserCog },
                ],
            },
            {
                title: "Asistencia",
                items: [
                    {
                        name: "Control Asistencia",
                        href: "/dashboard/asistencia",
                        icon: UserCheck,
                    },
                    {
                        name: "Historial Asistencia",
                        href: "/dashboard/asistencia/historial",
                        icon: History,
                    },
                    {
                        name: "Ranking Semanal",
                        href: "/dashboard/asistencia/ranking",
                        icon: Award,
                    },
                ],
            },
            {
                title: "Designaciones",
                items: [
                    {
                        name: "Designaciones",
                        href: "/dashboard/designaciones",
                        icon: Calendar,
                    },
                ],
            },
            {
                title: "Campeonato",
                items: [
                    {
                        name: "Campeonatos",
                        href: "/dashboard/campeonatos",
                        icon: Trophy,
                    },
                    {
                        name: "Equipos",
                        href: "/dashboard/campeonatos/equipos",
                        icon: Users,
                    },
                    {
                        name: "Reportes",
                        href: "/dashboard/reportes",
                        icon: FileText,
                    },
                ],
            },
        ]
    }

    // ADMIN: Acceso total
    if (rol === "ADMIN") {
        return [
            ...menuPrincipal,
            {
                title: "Permisos",
                items: [
                    { name: "Solicitar Permiso", href: "/dashboard/solicitar-permiso", icon: Send },
                    { name: "Ver Solicitudes", href: "/dashboard/solicitudes", icon: Inbox },
                ],
            },
            {
                title: "Administración",
                items: [
                    { name: "Usuarios", href: "/dashboard/usuarios", icon: UserCog },
                    { name: "Árbitros", href: "/dashboard/arbitros", icon: Users },
                ],
            },
            {
                title: "Asistencia",
                items: [
                    {
                        name: "Control Asistencia",
                        href: "/dashboard/asistencia",
                        icon: UserCheck,
                    },
                    {
                        name: "Historial Asistencia",
                        href: "/dashboard/asistencia/historial",
                        icon: History,
                    },
                ],
            },
            {
                title: "Designaciones",
                items: [
                    {
                        name: "Designaciones",
                        href: "/dashboard/designaciones",
                        icon: Calendar,
                    },
                ],
            },
            {
                title: "Campeonato",
                items: [
                    {
                        name: "Campeonatos",
                        href: "/dashboard/campeonatos",
                        icon: Trophy,
                    },
                    {
                        name: "Equipos",
                        href: "/dashboard/campeonatos/equipos",
                        icon: Users,
                    },
                    {
                        name: "Reportes",
                        href: "/dashboard/reportes",
                        icon: FileText,
                    },
                ],
            },
        ]
    }

    // Default: Acceso básico
    return [
        ...menuPrincipal,
        {
            title: "Gestión",
            items: [{ name: "Árbitros", href: "/dashboard/arbitros", icon: Users }],
        },
        {
            title: "Asistencia",
            items: [
                {
                    name: "Control Asistencia",
                    href: "/dashboard/asistencia",
                    icon: UserCheck,
                },
                {
                    name: "Historial Asistencia",
                    href: "/dashboard/asistencia/historial",
                    icon: History,
                },
                {
                    name: "Ranking Semanal",
                    href: "/dashboard/asistencia/ranking",
                    icon: Award,
                },
            ],
        },
        {
            title: "Designaciones",
            items: [
                {
                    name: "Designaciones",
                    href: "/dashboard/designaciones",
                    icon: Calendar,
                },
            ],
        },
        {
            title: "Campeonato",
            items: [
                {
                    name: "Campeonatos",
                    href: "/dashboard/campeonatos",
                    icon: Trophy,
                },
                {
                    name: "Equipos",
                    href: "/dashboard/campeonatos/equipos",
                    icon: Users,
                },
                {
                    name: "Reportes",
                    href: "/dashboard/reportes",
                    icon: FileText,
                },
            ],
        },
    ]
}

function getRolLabel(rol?: string): string {
    switch (rol) {
        case "ADMIN":
            return "Administrador"
        case "PRESIDENTE":
            return "Presidente"
        case "ARBITRO":
            return "Árbitro"
        default:
            return "Usuario"
    }
}

/* =======================
   DASHBOARD LAYOUT
  ======================= */

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isOpen, setIsOpen] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [usuario, setUsuario] = useState<Usuario | null>(null)
    const router = useRouter()
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        // Verificar si hay usuario logueado
        const user = getStoredUser()
        if (!user) {
            router.push("/login")
            return
        }
        setUsuario(user)
        
        // Check if mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
            if (window.innerWidth < 768) {
                setIsOpen(false)
            }
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/login")
    }

    const menuItems = getMenuItems(usuario?.rol as RolUsuario, usuario?.permisosEspecificos)
    
    // En móvil mostrar siempre los labels y iconos, en desktop según estado
    const showLabels = !isMobile && isOpen
    const sidebarWidth = isMobile ? (mobileMenuOpen ? "w-72" : "w-0") : (isOpen ? "w-64" : "w-20")

    return (
        <div className="flex min-h-screen bg-slate-950">
            {/* Mobile menu backdrop */}
            {mobileMenuOpen && isMobile && (
                <div 
                    className="fixed inset-0 bg-black/60 z-40"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`bg-slate-900 text-white flex flex-col
          transition-all duration-300 ease-in-out fixed md:relative z-50 overflow-hidden border-r border-slate-700/50
          ${isMobile ? (mobileMenuOpen ? "translate-x-0" : "-translate-x-full") : ""}
          ${isMobile ? "h-full" : ""}
          ${!isMobile ? sidebarWidth : "w-72"}
        `}
            >
                {/* Header accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

                {/* HEADER / LOGO */}
                <div className="px-4 py-4 border-b border-slate-700/50 flex items-center justify-between min-h-[72px]">
                    {showLabels ? (
                        <div className="flex items-center gap-3">
                            <img
                                src="/coda.jpeg"
                                alt="Logo"
                                className="h-10 w-10 rounded-xl object-cover bg-white p-1"
                            />
                            <div>
                                <h1 className="text-sm font-bold text-white">SIDAF PUNO</h1>
                                <p className="text-[10px] text-slate-400">Comisión de Árbitros</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <img
                                src="/coda.jpeg"
                                alt="Logo"
                                className="h-8 w-8 rounded-lg object-cover bg-white p-0.5"
                            />
                            {isMobile && mobileMenuOpen && (
                                <span className="text-sm font-bold">SIDAF</span>
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => isMobile ? setMobileMenuOpen(!mobileMenuOpen) : setIsOpen(!isOpen)}
                        className="p-2 rounded-lg hover:bg-slate-700/50 transition"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>

                {/* MENÚ */}
                <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
                    {menuItems.map((section) => (
                        <div key={section.title}>
                            {showLabels || (isMobile && mobileMenuOpen) ? (
                                <p className="text-xs uppercase text-slate-400 mb-2 px-2">
                                    {section.title}
                                </p>
                            ) : null}

                            <div className="space-y-1">
                                {section.items.map((item) => (
                                    <NavLink
                                        key={item.name}
                                        {...item}
                                        showLabels={showLabels || (isMobile && mobileMenuOpen)}
                                        onClick={() => isMobile && setMobileMenuOpen(false)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* USUARIO LOGUEADO */}
                {usuario && (
                    <div className="p-3 border-t border-slate-700/50">
                        {showLabels || (isMobile && mobileMenuOpen) ? (
                            <div className="flex items-center gap-3 px-2 py-2">
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/25">
                                    <Shield className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate text-white">
                                        {usuario.nombre} {usuario.apellido}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {getRolLabel(usuario.rol)}
                                    </p>
                                    {usuario.cargoCodar && (
                                        <p className="text-xs text-indigo-400 truncate">
                                            {usuario.cargoCodar} - {usuario.areaCodar}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-1.5 rounded-lg hover:bg-slate-700/50 transition"
                                    title="Cerrar sesión"
                                >
                                    <LogOut className="h-4 w-4 text-slate-400" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className="w-full p-2 rounded-lg hover:bg-slate-700/50 transition flex items-center justify-center"
                                title="Cerrar sesión"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                )}
            </aside>

            {/* CONTENIDO */}
            <main className={`flex-1 px-4 md:px-10 py-8 overflow-y-auto ${isMobile ? "w-full" : ""}`}>
                {/* Botón flotante para móvil */}
                {isMobile && !mobileMenuOpen && (
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="fixed bottom-6 right-6 z-30 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                )}
                {children}
            </main>
        </div>
    )
}
