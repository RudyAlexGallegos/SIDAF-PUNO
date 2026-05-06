"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProfileStructureProps {
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
 * Componente reutilizable para perfiles con diseño uniforme al dashboard
 */
export default function ProfileStructure({
    children,
    title,
    description,
    showBackButton = true,
    backHref = "/dashboard",
    actions,
    maxWidth = "full",
    icon: Icon
}: ProfileStructureProps) {
    
    const maxWidthClasses = {
        sm: "max-w-sm",
        md: "max-w-2xl", 
        lg: "max-w-4xl",
        xl: "max-w-7xl",
        full: "max-w-full"
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
            {/* Header section with sky gradient */}
            <div className="bg-gradient-to-r from-sky-100 via-sky-50 to-white border-b border-sky-200">
                <div className="container mx-auto px-4 md:px-6 py-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
                        <div className="flex items-center gap-4">
                            {showBackButton && (
                                <Link href={backHref}>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="hover:bg-sky-100 text-sky-600 hover:text-sky-700"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                </Link>
                            )}
                            <div className="flex items-center gap-3">
                                {Icon && (
                                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg">
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-sky-900">
                                        {title}
                                    </h1>
                                    {description && (
                                        <p className="text-sm text-sky-600 mt-1">
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
 * Card estándar para las páginas de perfil
 */
export function ProfileCard({ 
    children, 
    className = "",
    noPadding = false 
}: { 
    children: React.ReactNode
    className?: string
    noPadding?: boolean
}) {
    return (
        <div className={`bg-white rounded-2xl shadow-lg border border-sky-100 ${noPadding ? "" : "p-4 md:p-6"} ${className}`}>
            {children}
        </div>
    )
}

/**
 * Sección con título para usar dentro de ProfileCard
 */
export function ProfileSectionTitle({ 
    children, 
    icon: Icon 
}: { 
    children: React.ReactNode
    icon?: LucideIcon
}) {
    return (
        <div className="flex items-center gap-2 mb-4">
            {Icon && <Icon className="h-5 w-5 text-sky-600" />}
            <h2 className="text-lg font-semibold text-sky-900">
                {children}
            </h2>
        </div>
    )
}

/**
 * Stats Grid para cards de información
 */
export function ProfileStatsGrid({ 
    children 
}: { 
    children: React.ReactNode 
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {children}
        </div>
    )
}
