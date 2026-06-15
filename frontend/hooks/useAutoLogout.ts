"use client"

import { logout } from "@/services/api"

const AUTO_LOGOUT_INACTIVITY_MS = 60_000

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

    return { forceLogout, resetLogoutTimer }
}
