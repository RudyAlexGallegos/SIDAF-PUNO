// Script para diagnosticar datos corruptos en observaciones
// Ejecutar en la consola del navegador cuando estés en la página de historial de asistencia
// Uso: Copiar y pegar este código en la consola del navegador (F12)

async function diagnosticarObservaciones() {
  console.log('🔍 Iniciando diagnóstico de observaciones...')
  
  try {
    // Obtener todas las asistencias desde el estado global o API
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
    
    let registrosCorruptos = []
    let registrosValidos = []
    let registrosSinObservaciones = []
    let registrosNoEsArray = []
    let registrosJSONInvalido = []
    
    asistencias.forEach(asistencia => {
      if (!asistencia.observaciones || asistencia.observaciones === '') {
        registrosSinObservaciones.push({
          id: asistencia.id,
          fecha: asistencia.fecha
        })
        return
      }
      
      try {
        const parsed = JSON.parse(asistencia.observaciones)
        
        if (!Array.isArray(parsed)) {
          registrosNoEsArray.push({
            id: asistencia.id,
            fecha: asistencia.fecha,
            tipo: typeof parsed,
            valor: asistencia.observaciones
          })
          return
        }
        
        // Verificar campos corruptos
        const tieneCamposCorruptos = parsed.some(reg => 
          reg.aribroId || reg.aritroId || !reg.arbitrId
        )
        
        if (tieneCamposCorruptos) {
          const camposCorruptos = []
          parsed.forEach((reg, idx) => {
            if (reg.aribroId) camposCorruptos.push(`[${idx}] aribroId`)
            if (reg.aritroId) camposCorruptos.push(`[${idx}] aritroId`)
            if (!reg.arbitrId && !reg.arbitroId) camposCorruptos.push(`[${idx}] sin ID`)
          })
          
          registrosCorruptos.push({
            id: asistencia.id,
            fecha: asistencia.fecha,
            actividad: asistencia.actividad,
            error: 'Campos corruptos (aribroId/aritroId)',
            camposCorruptos: camposCorruptos,
            valor: asistencia.observaciones
          })
        } else {
          registrosValidos.push(asistencia.id)
        }
      } catch (e) {
        registrosJSONInvalido.push({
          id: asistencia.id,
          fecha: asistencia.fecha,
          error: 'JSON inválido',
          mensaje: e.message,
          valor: asistencia.observaciones
        })
      }
    })
    
    console.log('═══════════════════════════════════════════════════════════════')
    console.log('📊 DIAGNÓSTICO DE OBSERVACIONES')
    console.log('═══════════════════════════════════════════════════════════════')
    console.log(`📋 Total de registros: ${asistencias.length}`)
    console.log(`✅ Registros válidos: ${registrosValidos.length}`)
    console.log(`⚠️  Registros sin observaciones: ${registrosSinObservaciones.length}`)
    console.log(`⚠️  Registros no son array: ${registrosNoEsArray.length}`)
    console.log(`⚠️  Registros con JSON inválido: ${registrosJSONInvalido.length}`)
    console.log(`❌ Registros corruptos: ${registrosCorruptos.length}`)
    console.log('═══════════════════════════════════════════════════════════════')
    
    if (registrosCorruptos.length > 0) {
      console.log('\n🔴 REGISTROS CON CAMPOS CORRUPTOS:')
      console.log('═══════════════════════════════════════════════════════════════')
      registrosCorruptos.forEach((reg, idx) => {
        console.log(`\n${idx + 1}. ID: ${reg.id} | Fecha: ${reg.fecha} | Actividad: ${reg.actividad}`)
        console.log(`   Campos corruptos: ${reg.camposCorruptos.join(', ')}`)
        console.log(`   Valor: ${reg.valor}`)
      })
    }
    
    if (registrosNoEsArray.length > 0) {
      console.log('\n🟡 REGISTROS QUE NO SON ARRAY:')
      console.log('═══════════════════════════════════════════════════════════════')
      registrosNoEsArray.forEach((reg, idx) => {
        console.log(`\n${idx + 1}. ID: ${reg.id} | Fecha: ${reg.fecha}`)
        console.log(`   Tipo: ${reg.tipo}`)
        console.log(`   Valor: ${reg.valor}`)
      })
    }
    
    if (registrosJSONInvalido.length > 0) {
      console.log('\n🟡 REGISTROS CON JSON INVÁLIDO:')
      console.log('═══════════════════════════════════════════════════════════════')
      registrosJSONInvalido.forEach((reg, idx) => {
        console.log(`\n${idx + 1}. ID: ${reg.id} | Fecha: ${reg.fecha}`)
        console.log(`   Error: ${reg.mensaje}`)
        console.log(`   Valor: ${reg.valor}`)
      })
    }
    
    if (registrosSinObservaciones.length > 0) {
      console.log('\n🟡 REGISTROS SIN OBSERVACIONES:')
      console.log('═══════════════════════════════════════════════════════════════')
      registrosSinObservaciones.forEach((reg, idx) => {
        console.log(`${idx + 1}. ID: ${reg.id} | Fecha: ${reg.fecha}`)
      })
    }
    
    const resultado = {
      total: asistencias.length,
      validos: registrosValidos.length,
      sinObservaciones: registrosSinObservaciones.length,
      noEsArray: registrosNoEsArray.length,
      jsonInvalido: registrosJSONInvalido.length,
      corruptos: registrosCorruptos.length,
      detalles: {
        corruptos: registrosCorruptos,
        noEsArray: registrosNoEsArray,
        jsonInvalido: registrosJSONInvalido,
        sinObservaciones: registrosSinObservaciones
      }
    }
    
    console.log('\n✅ Diagnóstico completado!')
    console.log('💡 Para exportar el resultado, ejecuta: copy(resultado)')
    
    return resultado
    
  } catch (error) {
    console.error('❌ Error ejecutando diagnóstico:', error)
    console.error(error.stack)
  }
}

// Ejecutar diagnóstico
console.log('🚀 Ejecutando script de diagnóstico...')
diagnosticarObservaciones()
