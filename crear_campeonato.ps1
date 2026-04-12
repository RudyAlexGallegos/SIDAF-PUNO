$campeonato = @{
    nombre = "Copa Perú 2026"
    categoria = "Primera División"
    tipo = "Liga"
    estado = "PROGRAMADO"
    fechaInicio = "2026-04-15"
    fechaFin = "2026-12-31"
    organizador = "SIDAF Puno"
    contacto = "951234567"
    ciudad = "Puno"
    provincia = "Puno"
    direccion = "Estadio ETB"
    estadio = "Enrique Torres Beltrán"
    horaInicio = "15:00"
    horaFin = "18:00"
    diasJuego = "sábado,domingo"
    nivelDificultad = "Alto"
    numeroEquipos = 13
    formato = "League"
    etapas = @()
    equipos = @()
} | ConvertTo-Json -Depth 10

$response = Invoke-WebRequest -Uri "http://localhost:8083/api/campeonato" -Method Post -Body $campeonato -ContentType "application/json" -UseBasicParsing -ErrorAction Stop

Write-Host "Campeonato creado exitosamente"
$json = $response.Content | ConvertFrom-Json
Write-Host ("ID: " + $json.id)
Write-Host ("Nombre: " + $json.nombre)
Write-Host ("Estado: " + $json.estado)
