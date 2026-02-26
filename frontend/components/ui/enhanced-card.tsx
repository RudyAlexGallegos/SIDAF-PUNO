"use client"

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface EnhancedCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
}

export function EnhancedCard({ 
  children, 
  className, 
  hover = true,
  gradient = false 
}: EnhancedCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card text-card-foreground shadow-sm",
        "transition-all duration-300 ease-in-out",
        hover && "hover:shadow-lg hover:-translate-y-1 cursor-pointer",
        gradient && "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  iconColor?: string
  action?: React.ReactNode
  className?: string
}

export function CardHeader({ 
  title, 
  description, 
  icon: Icon, 
  iconColor = "text-blue-600",
  action,
  className 
}: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between p-4 md:p-6", className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={cn("p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30", iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-slate-500 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn("p-4 md:p-6 pt-0", className)}>
      {children}
    </div>
  )
}
