import { redirect } from "next/navigation"

interface Params {
  id: string
}

export default function DetalleCampeonatoRedirect({ params }: { params: Params }) {
  redirect(`/dashboard/campeonatos/${params.id}`)
}
