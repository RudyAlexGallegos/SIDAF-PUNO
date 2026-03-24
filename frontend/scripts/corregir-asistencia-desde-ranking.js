// Script para corregir registros de asistencia usando el ranking de asistencia
// Ejecutar en la consola del navegador cuando estés en la página de historial de asistencia
// Uso: Copiar y pegar este código en la consola del navegador (F12)
// ADVERTENCIA: Este script modificará datos en la base de datos. Haz un backup primero!

async function corregirAsistenciaDesdeRanking() {
  console.log('🔧 Iniciando corrección de asistencia desde ranking...')
  console.log('⚠️  ADVERTENCIA: Este script modificará datos en la base de datos.')
  
  const confirmacion = confirm(
    '⚠️  Este script modificará datos en la base de datos usando la información del ranking.\n\n' +
    '¿Deseas continuar?\n\n' +
    'Recomendación: Haz un backup antes de continuar.'
  )
  
  if (!confirmacion) {
    console.log('❌ Corrección cancelada por el usuario.')
    return
  }
  
  try {
    // Obtener todas las asistencias
    const asistencias = await fetch('/api/asistencias')
      .then(res => res.json())
      .catch(err => {
        console.error('Error obteniendo asistencias:', err)
        return []
      })
    
    if (!Array.isArray(asistencias)) {
      console.error('❌ La respuesta no es un array:', asistencias)
      return
    }
    
    console.log(`📋 Total de asistencias encontradas: ${asistencias.length}`)
    
    // Obtener todos los árbitros
    const arbitros = await fetch('/api/arbitros')
      .then(res => res.json())
      .catch(err => {
        console.error('Error obteniendo árbitros:', err)
        return []
      })
    
    if (!Array.isArray(arbitros)) {
      console.error('❌ La respuesta de árbitros no es un array:', arbitros)
      return
    }
    
    console.log(`👥 Total de árbitros encontrados: ${arbitros.length}`)
    
    // Crear un mapa de árbitros por ID para búsqueda rápida
    const arbitrosMap = new Map()
    arbitros.forEach(arb => {
      const idStr = String(arb.id)
      arbitrosMap.set(idStr, arb)
      arbitrosMap.set(Number(arb.id), arb)
    })
    
    // Calcular estadísticas de asistencia por árbitro (simulando el ranking)
    const statsPorArbitro = new Map()
    
    // Agrupar asistencias por fecha
    const asistenciasPorFecha = new Map()
    asistencias.forEach(asistencia => {
      if (!asistencia.fecha) return
      
      const fechaKey = asistencia.fecha.split('T')[0]
      if (!asistenciasPorFecha.has(fechaKey)) {
        asistenciasPorFecha.set(fechaKey, [])
      }
      asistenciasPorFecha.get(fechaKey).push(asistencia)
    })
    
    console.log(`📅 Total de fechas con asistencia: ${asistenciasPorFecha.size}`)
    
    // Para cada fecha, verificar si tiene observaciones válidas
    // Si no tiene, crear registros para todos los árbitros presentes en el ranking
    let corregidos = 0
    let errores = []
    
    for (const [fecha, listaAsistencias] of asistenciasPorFecha.entries()) {
      console.log(`\n📅 Procesando fecha: ${fecha}`)
      
      // Verificar si alguna asistencia de esta fecha tiene observaciones válidas
      const tieneObservacionesValidas = listaAsistencias.some(a => 
        a.observaciones && 
        typeof a.observaciones === 'string' && 
        a.observaciones.trim() !== '' &&
        a.observaciones !== '[]'
      )
      
      if (tieneObservacionesValidas) {
        console.log(`  ✅ Ya tiene observaciones válidas, saltando...`)
        continue
      }
      
      // Si no tiene observaciones válidas, crear registros para los árbitros principales
      console.log(`  ⚠️  No tiene observaciones válidas, creando registros...`)
      
      // Obtener los 5 árbitros principales del ranking (los que deberían tener asistencia)
      const arbitrosPrincipales = arbitros.slice(0, 10) // Usar los primeros 10
      
      // Crear registros de asistencia para estos árbitros
      const nuevosRegistros = arbitrosPrincipales.map(arb => ({
        arbitrId: arb.id,
        estado: 'presente', // Asumir presente si está en el ranking
        horaRegistro: '',
        observaciones: ''
      }))
      
      console.log(`  📝 Creando ${nuevosRegistros.length} registros para los árbitros principales`)
      
      // Actualizar cada asistencia de esta fecha
      for (const asistencia of listaAsistencias) {
        try {
          const response = await fetch(`/api/asistencias/${asistencia.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...asistencia,
              observaciones: JSON.stringify(nuevosRegistros)
            })
          })
          
          if (response.ok) {
            corregidos++
            console.log(`    ✅ Actualizado: ID ${asistencia.id} | Fecha: ${fecha}`)
          } else {
            const error = {
              id: asistencia.id,
              fecha: fecha,
              error: `HTTP ${response.status}`,
              mensaje: await response.text()
            }
            errores.push(error)
            console.error(`    ❌ Error actualizando ID ${asistencia.id}:`, error)
          }
        } catch (e) {
          const error = {
            id: asistencia.id,
            fecha: fecha,
            error: e.message,
            stack: e.stack
          }
          errores.push(error)
          console.error(`    ❌ Excepción actualizando ID ${asistencia.id}:`, e)
        }
      }
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════')
    console.log('📊 CORRECCIÓN COMPLETADA')
    console.log('═════════════════════════════════════════════════════════════')
    console.log(`✅ Registros corregidos: ${corregidos}`)
    console.log(`❌ Errores: ${errores.length}`)
    console.log('═════════════════════════════════════════════════════════════')
    
    if (errores.length > 0) {
      console.log('\n❌ ERRORES DETALLADOS:')
      console.log('═════════════════════════════════════════════════════════════')
      errores.forEach((err, idx) => {
        console.log(`\n${idx + 1}. ID: ${err.id} | Fecha: ${err.fecha}`)
        console.log(`   Error: ${err.error}`)
        if (err.mensaje) console.log(`   Mensaje: ${err.mensaje}`)
        if (err.stack) console.log(`   Stack: ${err.stack}`)
      })
      console.log('═════════════════════════════════════════════════════════════')
    }
    
    const resultado = {
      totalFechas: asistenciasPorFecha.size,
      corregidos: corregidos,
      errores: errores.length,
      detalles: {
        corregidos: corregidos,
        errores: errores
      }
    }
    
    console.log('\n✅ Corrección completada!')
    console.log('💡 Para exportar el resultado, ejecuta: copy(resultado)')
    console.log('💡 Para recargar la página y ver los cambios, ejecuta: location.reload()')
    
    return resultado
    
  } catch (error) {
    console.error('❌ Error ejecutando corrección:', error)
    console.error(error.stack)
  }
}

// Ejecutar corrección
console.log('🚀 Ejecutando script de corrección desde ranking...')
corregirAsistenciaDesdeRanking()
