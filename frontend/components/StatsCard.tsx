"use client"

import React from "react"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps {
    title: string
    value: string | number
    description?: string
    icon: LucideIcon
    trend?: {
        value: number
        isPositive: boolean
    }
    color?: "blue" | "purple" | "emerald" | "amber" | "red" | "indigo"
}

const colorClasses: Record<string, Record<string, string>> = {
    blue: {
        bg: "bg-blue-500/10 dark:bg-blue-500/20",
        border: "border-blue-500/20 dark:border-blue-500/30",
        icon: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
        accent: "text-blue-600 dark:text-blue-400"
    },
    purple: {
        bg: "bg-purple-500/10 dark:bg-purple-500/20",
        border: "border-purple-500/20 dark:border-purple-500/30",
        icon: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
        accent: "text-purple-600 dark:text-purple-400"
    },
    emerald: {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        border: "border-emerald-500/20 dark:border-emerald-500/30",
        icon: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
        accent: "text-emerald-600 dark:text-emerald-400"
    },
    amber: {
        bg: "bg-amber-500/10 dark:bg-amber-500/20",
        border: "border-amber-500/20 dark:border-amber-500/30",
        icon: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
        accent: "text-amber-600 dark:text-amber-400"
    },
    red: {
        bg: "bg-red-500/10 dark:bg-red-500/20",
        border: "border-red-500/20 dark:border-red-500/30",
        icon: "bg-red-500/20 text-red-600 dark:text-red-400",
        accent: "text-red-600 dark:text-red-400"
    },
    indigo: {
        bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
        border: "border-indigo-500/20 dark:border-indigo-500/30",
        icon: "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
        accent: "text-indigo-600 dark:text-indigo-400"
    }
}

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    color = "blue"
}: StatsCardProps) {
    const colorClass = colorClasses[color]

    return (
        <div className={`
            p-6 rounded-xl border backdrop-blur-sm
            transition-all duration-300 hover:shadow-lg hover:scale-105
            ${colorClass.bg} ${colorClass.border}
            dark:bg-slate-800 dark:border-slate-700
            bg-white border-slate-200
        `}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                        {title}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                            {value}
                        </p>
                        {trend && (
                            <div className={`flex items-center gap-1 text-sm font-semibold ${
                                trend.isPositive 
                                    ? "text-emerald-600 dark:text-emerald-400" 
                                    : "text-red-600 dark:text-red-400"
                            }`}>
                                {trend.isPositive ? (
                                    <TrendingUp className="h-4 w-4" />
                                ) : (
                                    <TrendingDown className="h-4 w-4" />
                                )}
                                {trend.value}%
                            </div>
                        )}
                    </div>
                    {description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            {description}
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${colorClass.icon}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    )
}
