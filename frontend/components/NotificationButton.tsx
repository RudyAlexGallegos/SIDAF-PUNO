'use client'

import { Bell } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'

export function NotificationButton() {
  const [hasNotifications, setHasNotifications] = useState(true)
  const [isHovering, setIsHovering] = useState(false)

  const handleClick = () => {
    toast({
      title: "🔔 Notificaciones",
      description: "Esta opción estará disponible en la próxima versión",
      duration: 3000,
    })
  }

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="p-2.5 rounded-base hover:bg-muted dark:hover:bg-muted/50 transition-all duration-300 text-muted-foreground hover:text-foreground hover:shadow-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950 focus:ring-primary"
        title="Notificaciones"
        aria-label="Notifications"
      >
        <div className="relative">
          <Bell className="h-5 w-5 transition-all duration-300" />
          {hasNotifications && (
            <span 
              className={`
                absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-red-400 to-red-600 rounded-full 
                transition-all duration-300
                ${isHovering ? 'scale-150 shadow-lg shadow-red-500/50' : 'animate-pulse'}
              `}
            ></span>
          )}
        </div>
      </button>
      
      {/* Tooltip */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        Próximamente
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
      </div>
    </div>
  )
}
