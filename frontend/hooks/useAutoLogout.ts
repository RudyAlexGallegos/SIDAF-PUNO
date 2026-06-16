"use client"

import { logout } from "@/services/api"
import { useEffect } from "react"

const AUTO_LOGOUT_INACTIVITY_MS = 4 * 60 * 1000 // 4 minutos

export function useAutoLogout() {
    const resetLogoutTimer = () => {
        if (typeof window === "undefined") return
    }

    useEffect(() => {
        let logoutTimer: ReturnType<typeof setTimeout> | null = null

        const handleActivity = () => {
            if (logoutTimer) {
                clearTimeout(logoutTimer)
            }
            logoutTimer = setTimeout(() => {
                void logout()
                window.location.href = "/login"
            }, AUTO_LOGOUT_INACTIVITY_MS)
        }

        const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]
        events.forEach(event => {
            window.addEventListener(event, handleActivity)
        })

        handleActivity()

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity)
            })
            if (logoutTimer) {
                clearTimeout(logoutTimer)
            }
        }
    }, [])

    return { resetLogoutTimer }
}
