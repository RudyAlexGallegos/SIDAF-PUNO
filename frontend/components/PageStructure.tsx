"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageStructureProps {
    children: React.ReactNode
    title: string
    description?: string
    showBackButton?: boolean
    backHref?: string
    actions?: React.ReactNode
    maxWidth?: "sm" | "md" | "lg" | "xl" | "full"
    icon?: LucideIcon
}

/**
 * Componente reutilizable para estandarizar la estructura de todas las páginas
 */
export default function PageStructure({
    children,
    title,
    description,
    showBackButton = true,
    backHref = "/dashboard",
    actions,
    maxWidth = "full",
    icon: Icon
}: PageStructureProps) {
    
    const maxWidthClasses = {
        sm: "max-w-sm",
        md: "max-w-2xl", 
        lg: "max-w-4xl",
        xl: "max-w-7xl",
        full: "max-w-full"
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950">
            {/* Header section with gradient */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
                <div className="container mx-auto px-4 md:px-6 py-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
                        <div className="flex items-center gap-4">
                            {showBackButton && (
                                <Link href={backHref}>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="hover:bg-slate-700 text-slate-300 hover:text-white"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                </Link>
                            )}
                            <div className="flex items-center gap-3">
                                {Icon && (
                                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                                        {title}
                                    </h1>
                                    {description && (
                                        <p className="text-sm text-slate-400 mt-1">
                                            {description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {actions && (
                            <div className="flex items-center gap-2 sm:ml-4 flex-wrap">
                                {actions}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content section */}
            <div className="container mx-auto px-4 md:px-6 py-8">
                <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
                    {children}
                </div>
            </div>
        </div>
    )
}

/**
 * Card estándar para las páginas
 */
export function PageCard({ 
    children, 
    className = "",
    noPadding = false 
}: { 
    children: React.ReactNode
    className?: string
    noPadding?: boolean
}) {
    return (
        <div className={`bg-white rounded-2xl shadow-lg border border-slate-100 ${noPadding ? "" : "p-4 md:p-6"} ${className}`}>
            {children}
        </div>
    )
}

/**
 * Sección con título para usar dentro de PageCard
 */
export function SectionTitle({ 
    children, 
    icon: Icon 
}: { 
    children: React.ReactNode
    icon?: LucideIcon
}) {
    return (
        <div className="flex items-center gap-2 mb-4">
            {Icon && <Icon className="h-5 w-5 text-blue-600" />}
            <h2 className="text-lg font-semibold text-slate-900">
                {children}
            </h2>
        </div>
    )
}

/**
 * Grid de estadísticas para dashboards
 */
export function StatsGrid({ 
    children 
}: { 
    children: React.ReactNode 
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {children}
        </div>
    )
}

/**
 * Tarjeta de estadísticas individual
 */
export function StatCard({
    title,
    value,
    icon: Icon,
    color = "blue"
}: {
    title: string
    value: string | number
    icon?: LucideIcon
    color?: "blue" | "green" | "purple" | "orange" | "red"
}) {
    const colorClasses = {
        blue: "from-blue-50 to-indigo-50 border-blue-200 text-blue-600",
        green: "from-green-50 to-emerald-50 border-green-200 text-green-600",
        purple: "from-purple-50 to-indigo-50 border-purple-200 text-purple-600",
        orange: "from-orange-50 to-amber-50 border-orange-200 text-orange-600",
        red: "from-red-50 to-rose-50 border-red-200 text-red-600"
    }

    const iconBgClasses = {
        blue: "bg-blue-100",
        green: "bg-green-100",
        purple: "bg-purple-100",
        orange: "bg-orange-100",
        red: "bg-red-100"
    }

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl border p-4 md:p-5`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs md:text-sm font-medium opacity-80">{title}</p>
                    <p className="text-2xl md:text-3xl font-bold mt-1">{value}</p>
                </div>
                {Icon && (
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${iconBgClasses[color]} flex items-center justify-center`}>
                        <Icon className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * Campo de formulario estandarizado
 */
export function FormField({ 
    label, 
    children,
    required = false 
}: { 
    label: string
    children: React.ReactNode
    required?: boolean
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {children}
        </div>
    )
}

/**
 * Botón de acción primario estandarizado
 */
export function PrimaryButton({ 
    children, 
    onClick,
    disabled = false,
    type = "button",
    className = "",
    icon: Icon
}: { 
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    type?: "button" | "submit" | "reset"
    className?: string
    icon?: LucideIcon
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {Icon && <Icon className="h-4 w-4" />}
            {children}
        </button>
    )
}

/**
 * Botón secundario estandarizado
 */
export function SecondaryButton({ 
    children, 
    onClick,
    disabled = false,
    variant = "outline",
    className = "",
    icon: Icon
}: { 
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    variant?: "outline" | "ghost"
    className?: string
    icon?: LucideIcon
}) {
    const baseClasses = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all"
    const variantClasses = variant === "outline" 
        ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        : "text-slate-600 hover:bg-slate-100"

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {Icon && <Icon className="h-4 w-4" />}
            {children}
        </button>
    )
}

/**
 * Badge de estado estandarizado
 */
export function StatusBadge({ 
    children, 
    variant = "default"
}: { 
    children: React.ReactNode
    variant?: "default" | "success" | "warning" | "danger" | "info"
}) {
    const variantClasses = {
        default: "bg-slate-100 text-slate-700",
        success: "bg-green-100 text-green-700",
        warning: "bg-yellow-100 text-yellow-700",
        danger: "bg-red-100 text-red-700",
        info: "bg-blue-100 text-blue-700"
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
            {children}
        </span>
    )
}

/**
 * Empty state para listas vacías
 */
export function EmptyState({
    title,
    description,
    icon: Icon,
    action
}: {
    title: string
    description?: string
    icon?: LucideIcon
    action?: React.ReactNode
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            {Icon && (
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Icon className="h-8 w-8 text-slate-400" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-slate-500 mb-4 max-w-sm">{description}</p>
            )}
            {action}
        </div>
    )
}

/**
 * Campo de búsqueda estandarizado
 */
export function SearchField({
    value,
    onChange,
    placeholder = "Buscar..."
}: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}) {
    return (
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-10 md:h-12 pl-4 pr-10 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg 
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
    )
}

/**
 * Filtro select estandarizado
 */
interface SelectOption {
    label: string
    value: string
}

export function FilterSelect({
    value,
    onChange,
    options
}: {
    value: string
    onChange: (value: string) => void
    options: SelectOption[]
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 md:h-12 px-3 md:px-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    )
}
