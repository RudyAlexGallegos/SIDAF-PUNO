import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function ProximosPartidos() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="mb-2">
              Liga Nacional
            </Badge>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">FC Barcelona</p>
                <p className="text-sm text-muted-foreground">Local</p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback>FCB</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 text-sm font-medium">
                <span>VS</span>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback>RM</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Real Madrid</p>
                <p className="text-sm text-muted-foreground">Visitante</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">20/05/2025</p>
            <p className="text-sm text-muted-foreground">20:00</p>
            <Button variant="outline" size="sm" className="mt-2">
              Ver Detalles
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="mb-2">
              Copa Regional
            </Badge>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">Atlético Madrid</p>
                <p className="text-sm text-muted-foreground">Local</p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback>ATM</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 text-sm font-medium">
                <span>VS</span>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback>SEV</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Sevilla FC</p>
                <p className="text-sm text-muted-foreground">Visitante</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">21/05/2025</p>
            <p className="text-sm text-muted-foreground">18:30</p>
            <Button variant="outline" size="sm" className="mt-2">
              Ver Detalles
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="mb-2">
              Torneo Juvenil
            </Badge>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">Valencia CF</p>
                <p className="text-sm text-muted-foreground">Local</p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback>VCF</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 text-sm font-medium">
                <span>VS</span>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback>VIL</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Villarreal</p>
                <p className="text-sm text-muted-foreground">Visitante</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">22/05/2025</p>
            <p className="text-sm text-muted-foreground">16:00</p>
            <Button variant="outline" size="sm" className="mt-2">
              Ver Detalles
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
