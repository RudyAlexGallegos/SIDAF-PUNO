// Script para normalizar datos corruptos en observaciones
// Ejecutar en la consola del navegador cuando estés en la página de historial de asistencia
// Uso: Copiar y pegar este código en la consola del navegador (F12)
// ADVERTENCIA: Este script modificará datos en la base de datos. Haz un backup primero!

async function normalizarObservaciones() {
  console.log('🔧 Iniciando normalización de observaciones...')
  console.log('⚠️  ADVERTENCIA: Este script modificará datos en la base de datos.')
  
  const confirmacion = confirm(
    '⚠️  Este script modificará datos en la base de datos.\n\n' +
    '¿Deseas continuar?\n\n' +
    'Recomendación: Haz un backup antes de continuar.'
  )
  
  if (!confirmacion) {
    console.log('❌ Normalización cancelada por el usuario.')
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
    
    let corregidos = []
    let errores = []
    let sinCambios = []
    
    console.log(`📋 Procesando ${asistencias.length} registros...`)
    
    for (const asistencia of asistencias) {
      if (!asistencia.observaciones || asistencia.observaciones === '') {
        sinCambios.push({
          id: asistencia.id,
          razon: 'Sin observaciones'
        })
        continue
      }
      
      try {
        const parsed = JSON.parse(asistencia.observaciones)
        
        if (!Array.isArray(parsed)) {
          sinCambios.push({
            id: asistencia.id,
            razon: 'No es un array'
          })
          continue
        }
        
        // Verificar si necesita corrección
        const necesitaCorreccion = parsed.some(reg => 
          reg.aribroId || reg.aritroId || !reg.arbitrId
        )
        
        if (!necesitaCorreccion) {
          continue
        }
        
        // Normalizar campos
        const normalizados = parsed.map(reg => {
          const arbitrId = reg.arbitrId || reg.aribroId || reg.aritroId || reg.arbitroId || reg.id
          
          if (!arbitrId) {
            console.warn(`⚠️  Registro sin ID válido:`, reg)
          }
          
          return {
            arbitrId: arbitrId,
            estado: reg.estado || 'ausente',
            horaRegistro: reg.horaRegistro || '',
            observaciones: reg.observaciones || ''
          }
        })
        
        // Actualizar registro
        const response = await fetch(`/api/asistencias/${asistencia.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...asistencia,
            observaciones: JSON.stringify(normalizados)
          })
        })
        
        if (response.ok) {
          corregidos.push({
            id: asistencia.id,
            fecha: asistencia.fecha,
            actividad: asistencia.actividad,
            cambios: parsed.filter(reg => 
              reg.aribroId || reg.aritroId || !reg.arbitrId
            ).length
          })
          
          console.log(`✅ Corregido: ID ${asistencia.id} | Fecha: ${asistencia.fecha}`)
        } else {
          errores.push({
            id: asistencia.id,
            error: `HTTP ${response.status}`,
            mensaje: await response.text()
          })
          console.error(`❌ Error actualizando ID ${asistencia.id}:`, response.status)
        }
        
      } catch (e) {
        errores.push({
          id: asistencia.id,
          error: e.message,
          stack: e.stack
        })
        console.error(`❌ Error procesando ID ${asistencia.id}:`, e)
      }
    }
    
    console.log('═══════════════════════════════════════════════════════════════')
    console.log('📊 NORMALIZACIÓN COMPLETADA')
    console.log('═══════════════════════════════════════════════════════════════')
    console.log(`✅ Registros corregidos: ${corregidos.length}`)
    console.log(`⚠️  Registros sin cambios: ${sinCambios.length}`)
    console.log(`❌ Errores: ${errores.length}`)
    console.log('═══════════════════════════════════════════════════════════════')
    
    if (corregidos.length > 0) {
      console.log('\n✅ REGISTROS CORREGIDOS:')
      console.log('═══════════════════════════════════════════════════════════════')
      corregidos.forEach((reg, idx) => {
        console.log(`\n${idx + 1}. ID: ${reg.id} | Fecha: ${reg.fecha} | Actividad: ${reg.actividad}`)
        console.log(`   Cambios aplicados: ${reg.cambios}`)
      })
    }
    
    if (errores.length > 0) {
      console.log('\n❌ ERRORES:')
      console.log('═══════════════════════════════════════════════════════════════')
      errores.forEach((err, idx) => {
        console.log(`\n${idx + 1}. ID: ${err.id}`)
        console.log(`   Error: ${err.error}`)
        if (err.mensaje) console.log(`   Mensaje: ${err.mensaje}`)
        if (err.stack) console.log(`   Stack: ${err.stack}`)
      })
    }
    
    if (sinCambios.length > 0) {
      console.log('\n⚠️  REGISTROS SIN CAMBIOS:')
      console.log('═══════════════════════════════════════════════════════════════')
      sinCambios.forEach((reg, idx) => {
        console.log(`${idx + 1}. ID: ${reg.id} | Razón: ${reg.razon}`)
      })
    }
    
    const resultado = {
      total: asistencias.length,
      corregidos: corregidos.length,
      sinCambios: sinCambios.length,
      errores: errores.length,
      detalles: {
        corregidos: corregidos,
        sinCambios: sinCambios,
        errores: errores
      }
    }
    
    console.log('\n✅ Normalización completada!')
    console.log('💡 Para exportar el resultado, ejecuta: copy(resultado)')
    console.log('💡 Para recargar la página y ver los cambios, ejecuta: location.reload()')
    
    return resultado
    
  } catch (error) {
    console.error('❌ Error ejecutando normalización:', error)
    console.error(error.stack)
  }
}

// Ejecutar normalización
console.log('🚀 Ejecutando script de normalización...')
normalizarObservaciones()
