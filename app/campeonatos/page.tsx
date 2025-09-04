import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Search } from "lucide-react"

export default function CampeonatosPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ArrowLeft className="h-5 w-5" />
          <span>Volver al Dashboard</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Button asChild>
            <Link href="/campeonatos/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Campeonato
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gestión de Campeonatos</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Buscar campeonato..." className="w-[200px] pl-8 md:w-[260px]" />
            </div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Campeonatos Activos</CardTitle>
            <CardDescription>
              Listado de campeonatos registrados en el sistema con su nivel de dificultad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Nivel de Dificultad</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Equipos</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Liga Nacional</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                      Alto
                    </Badge>
                  </TableCell>
                  <TableCell>Primera División</TableCell>
                  <TableCell>20</TableCell>
                  <TableCell>15/01/2025</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500 hover:bg-green-600">En Curso</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Copa Regional</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                      Medio
                    </Badge>
                  </TableCell>
                  <TableCell>Segunda División</TableCell>
                  <TableCell>16</TableCell>
                  <TableCell>05/02/2025</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500 hover:bg-green-600">En Curso</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Torneo Juvenil</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                      Bajo
                    </Badge>
                  </TableCell>
                  <TableCell>Sub-19</TableCell>
                  <TableCell>12</TableCell>
                  <TableCell>20/03/2025</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500 hover:bg-green-600">En Curso</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Copa Internacional</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                      Alto
                    </Badge>
                  </TableCell>
                  <TableCell>Elite</TableCell>
                  <TableCell>32</TableCell>
                  <TableCell>10/04/2025</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                      Próximamente
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Liga Provincial</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                      Medio
                    </Badge>
                  </TableCell>
                  <TableCell>Tercera División</TableCell>
                  <TableCell>14</TableCell>
                  <TableCell>25/01/2025</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500 hover:bg-green-600">En Curso</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
