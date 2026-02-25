"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import html2pdf from "html2pdf.js"

import {
    ArrowLeft,
    Edit,
    Download,
    Phone,
    Mail,
    Award,
    User,
    CheckCircle,
    XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { getArbitros, Arbitro } from "@/services/api"

export default function VerArbitroPage() {
    const { id } = useParams()
    const router = useRouter()
    const [arbitro, setArbitro] = useState<Arbitro | null>(null)
    const pdfRef = useRef<HTMLDivElement>(null)

    // 🔹 Cargar árbitro (SIN getArbitroById)
    useEffect(() => {
        async function cargar() {
            const lista = await getArbitros()
            const encontrado = lista.find(a => a.id === Number(id))
            if (!encontrado) {
                router.push("/arbitros")
                return
            }
            setArbitro(encontrado)
        }
        cargar()
    }, [id, router])

    const exportarPDF = () => {
        if (!pdfRef.current || !arbitro) return

        html2pdf()
            .set({
                margin: 0.5,
                filename: `arbitro_${arbitro.nombre}_${arbitro.apellido}.pdf`,
                html2canvas: { scale: 2 },
                jsPDF: { unit: "in", format: "letter" },
            })
            .from(pdfRef.current)
            .save()
    }

    if (!arbitro) {
        return <div className="p-8">Cargando árbitro...</div>
    }

    const foto = (arbitro as any).fotoUrl as string | undefined

    return (
        <div className="min-h-screen bg-slate-50">
            {/* HEADER */}
            <header className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
                    <Link href="/arbitros" className="flex items-center gap-2 text-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Volver
                    </Link>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={exportarPDF}>
                            <Download className="w-4 h-4 mr-2" />
                            Exportar PDF
                        </Button>

                        <Button asChild>
                            <Link href={`/arbitros/${arbitro.id}/editar`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* DASHBOARD / CV */}
            <main className="max-w-5xl mx-auto px-6 py-10">
                <div ref={pdfRef}>
                    <Card className="shadow-xl">
                        <CardContent className="p-8 grid grid-cols-3 gap-8">
                            {/* COLUMNA IZQUIERDA */}
                            <aside className="col-span-1 border-r pr-6 space-y-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-32 h-32 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                                        {foto ? (
                                            <img
                                                src={foto}
                                                alt="Foto árbitro"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-14 h-14 text-slate-500" />
                                        )}
                                    </div>

                                    <h2 className="text-xl font-semibold mt-4">
                                        {arbitro.nombre} {arbitro.apellido}
                                    </h2>

                                    <Badge className="mt-2">{arbitro.categoria}</Badge>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <p className="flex items-center gap-2">
                                        {arbitro.disponible ? (
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-600" />
                                        )}
                                        {arbitro.disponible ? "Disponible" : "No disponible"}
                                    </p>

                                    {arbitro.telefono && (
                                        <p className="flex gap-2 items-center">
                                            <Phone className="w-4 h-4" />
                                            {arbitro.telefono}
                                        </p>
                                    )}

                                    {arbitro.email && (
                                        <p className="flex gap-2 items-center">
                                            <Mail className="w-4 h-4" />
                                            {arbitro.email}
                                        </p>
                                    )}
                                </div>
                            </aside>

                            {/* COLUMNA DERECHA */}
                            <section className="col-span-2 space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                        <Award className="w-5 h-5" />
                                        Perfil Profesional
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                        Árbitro con {arbitro.experiencia} años de experiencia en
                                        competiciones {arbitro.categoria?.toLowerCase()}, con
                                        desempeño consistente y compromiso con el reglamento y la
                                        ética deportiva.
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <Card className="p-4 text-center">
                                        <p className="text-2xl font-bold">{arbitro.experiencia}</p>
                                        <p className="text-xs text-slate-500">Años experiencia</p>
                                    </Card>

                                    <Card className="p-4 text-center">
                                        <p className="text-2xl font-bold">✔</p>
                                        <p className="text-xs text-slate-500">Reglamento</p>
                                    </Card>

                                    <Card className="p-4 text-center">
                                        <p className="text-2xl font-bold">A+</p>
                                        <p className="text-xs text-slate-500">Desempeño</p>
                                    </Card>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Observaciones</h3>
                                    <p className="text-sm text-slate-700 whitespace-pre-line">
                                        {arbitro.observaciones || "Sin observaciones registradas."}
                                    </p>
                                </div>
                            </section>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
