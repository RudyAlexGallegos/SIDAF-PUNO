"use client"

import { logout } from "@/services/api"
import { useEffect } from "react"

const AUTO_LOGOUT_INACTIVITY_MS = 4 * 60 * 1000 // 4 minutos

let logoutTimer: ReturnType<typeof setTimeout> | null = null
let isRedirecting = false

function resetLogoutTimer() {
    if (typeof window === "undefined") return

    if (logoutTimer) {
        clearTimeout(logoutTimer)
    }

    logoutTimer = setTimeout(() => {
        void logout()
        window.location.href = "/login"
    }, AUTO_LOGOUT_INACTIVITY_MS)
}

export function useAutoLogout() {
    const forceLogout = () => {
        if (isRedirecting) return

        isRedirecting = true

        if (logoutTimer) {
            clearTimeout(logoutTimer)
            logoutTimer = null
        }

        void logout().finally(() => {
            window.location.href = "/login"
        })
    }

    useEffect(() => {
        const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]
        
        const handleActivity = () => {
            isRedirecting = false
            resetLogoutTimer()
        }

        events.forEach(event => {
            window.addEventListener(event, handleActivity)
        })

        resetLogoutTimer()

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity)
            })
            if (logoutTimer) {
                clearTimeout(logoutTimer)
            }
        }
    }, [])

    return { forceLogout }
}
