$file = 'app/(dashboard)/dashboard/designaciones/nueva/page.tsx'
$content = Get-Content $file -Raw -Encoding UTF8
$start = $content.IndexOf('<Dialog open={mostrarDialogoParticipantes}')
$end = $content.IndexOf('</Dialog>', $start) + '</Dialog>'.Length
if ($start -gt 0 -and $end -gt 0) {
    $newContent = $content.Substring(0, $start) + $content.Substring($end)
    Set-Content -Path $file -Value $newContent -Encoding UTF8
    Write-Host "Removed Dialog block from $start to $end"
} else {
    Write-Host "Dialog not found"
}
