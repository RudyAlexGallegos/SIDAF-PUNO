import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "SIDAF PUNO",
  description: "Sistema de gestión arbitral",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-slate-50">
        {children}
      </body>
    </html>
  )
}
