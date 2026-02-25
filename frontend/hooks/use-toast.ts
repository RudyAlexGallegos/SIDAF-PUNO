"use client"

interface Toast {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export function toast({ title, description, variant = "default" }: Toast) {
  // Crear elemento de toast
  const toastElement = document.createElement("div")
  toastElement.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${variant === "destructive" ? "bg-red-500 text-white" : "bg-green-500 text-white"
    }`

  toastElement.innerHTML = `
    <div class="font-semibold">${title}</div>
    ${description ? `<div class="text-sm opacity-90 mt-1">${description}</div>` : ""}
  `

  document.body.appendChild(toastElement)

  // Animar entrada
  setTimeout(() => {
    toastElement.style.transform = "translateX(0)"
    toastElement.style.opacity = "1"
  }, 100)

  // Remover después de 3 segundos
  setTimeout(() => {
    toastElement.style.transform = "translateX(100%)"
    toastElement.style.opacity = "0"
    setTimeout(() => {
      document.body.removeChild(toastElement)
    }, 300)
  }, 3000)
}

export function useToast() {
  // keep a lightweight in-memory list for compatibility with Toaster component
  const toasts: Array<{ id: string; title: string; description?: string; action?: any }> = []
  return { toast, toasts }
}
