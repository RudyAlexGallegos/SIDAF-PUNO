"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Home,
    FileText,
    Calendar,
    Trophy,
    UserCheck,
    Users,
    Menu,
    LucideIcon,
} from "lucide-react"

/* =======================
   NAV LINK
 ======================= */

function NavLink({
    href,
    icon: Icon,
    name,
    isOpen,
}: {
    href: string
    icon: LucideIcon
    name: string
    isOpen: boolean
}) {
    const pathname = usePathname()
    const isActive = pathname === href

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 text-sm px-3 py-2 rounded-xl transition-all
        ${isActive
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-200 hover:bg-white/10"
                }`}
        >
            <Icon className="h-5 w-5 shrink-0" />
            {isOpen && <span>{name}</span>}
        </Link>
    )
}

/* =======================
   MENU DATA
 ======================= */

const menuItems = [
    {
        title: "Principal",
        items: [{ name: "Inicio", href: "/dashboard", icon: Home }],
    },
    {
        title: "Gestión",
        items: [{ name: "Árbitros", href: "/dashboard/arbitros", icon: Users }],
    },
    {
        title: "Asistencia",
        items: [
            {
                name: "Asistencia",
                href: "/dashboard/asistencia",
                icon: UserCheck,
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
                href: "/dashboard/campeonato",
                icon: Trophy,
            },
            {
                name: "Equipos",
                href: "/dashboard/campeonato/equipos",
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

/* =======================
   DASHBOARD LAYOUT
 ======================= */

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
            {/* SIDEBAR */}
            <aside
                className={`bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-64" : "w-20"}
        `}
            >
                {/* HEADER / LOGO */}
                <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
                    {isOpen && (
                        <div className="flex items-center gap-3">
                            <img
                                src="/images.jpeg"
                                alt="Logo SIDAF PUNO"
                                className="h-10 w-10 rounded-xl object-cover bg-white p-1"
                            />
                            <div>
                                <h1 className="text-sm font-bold">SIDAF PUNO</h1>
                                <p className="text-[10px] text-slate-400">
                                    Comisión Departartamental de Arbitros
                                </p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 rounded-lg hover:bg-white/10 transition"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>

                {/* MENÚ */}
                <nav className="flex-1 p-3 space-y-6">
                    {menuItems.map((section) => (
                        <div key={section.title}>
                            {isOpen && (
                                <p className="text-xs uppercase text-slate-400 mb-2 px-2">
                                    {section.title}
                                </p>
                            )}

                            <div className="space-y-1">
                                {section.items.map((item) => (
                                    <NavLink
                                        key={item.name}
                                        {...item}
                                        isOpen={isOpen}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* CONTENIDO */}
            <main className="flex-1 px-10 py-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
