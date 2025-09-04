import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function ArbitrosRecientes() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarFallback>CR</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-medium">Carlos Rodríguez</p>
            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
              FIFA
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Liga Nacional - Principal</p>
            <p className="text-xs text-muted-foreground">Hace 2 días</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarFallback>AM</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-medium">Ana Martínez</p>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
              Nacional
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Copa Regional - Asistente</p>
            <p className="text-xs text-muted-foreground">Hace 3 días</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarFallback>JT</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-medium">Javier Torres</p>
            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
              FIFA
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Liga Nacional - Principal</p>
            <p className="text-xs text-muted-foreground">Hace 4 días</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarFallback>ML</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-medium">Miguel López</p>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
              Regional
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Torneo Juvenil - Asistente</p>
            <p className="text-xs text-muted-foreground">Hace 5 días</p>
          </div>
        </div>
      </div>
    </div>
  )
}
