// Script para probar operaciones básicas de Supabase
import { supabase } from './supabaseClient.js'

// Función para probar inserción de datos
async function probarInsercion() {
  console.log('📝 Probando inserción de datos...')
  
  try {
    // Probar inserción de un club de prueba
    const { data: clubData, error: clubError } = await supabase
      .from('clubs')
      .insert({
        name: 'Club de Prueba',
        slug: 'club-prueba',
        founded_year: 2024,
        stadium: 'Estadio de Prueba',
        budget: 1000000,
        primary_color: '#FF0000',
        secondary_color: '#0000FF',
        description: 'Club creado para pruebas'
      })
      .select()
    
    if (clubError) {
      console.log(`❌ Error insertando club: ${clubError.message}`)
      return false
    }
    
    console.log('✅ Club insertado correctamente')
    console.log(`📊 ID del club: ${clubData[0].id}`)
    
    // Probar inserción de un jugador de prueba
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .insert({
        name: 'Jugador de Prueba',
        age: 25,
        nationality: 'España',
        dorsal: 10,
        position: 'MED',
        overall: 75,
        potential: 80,
        price: 5000000,
        salary: 50000
      })
      .select()
    
    if (playerError) {
      console.log(`❌ Error insertando jugador: ${playerError.message}`)
      return false
    }
    
    console.log('✅ Jugador insertado correctamente')
    console.log(`📊 ID del jugador: ${playerData[0].id}`)
    
    return { clubId: clubData[0].id, playerId: playerData[0].id }
  } catch (error) {
    console.error('❌ Error en inserción:', error.message)
    return false
  }
}

// Función para probar lectura de datos
async function probarLectura() {
  console.log('\n📖 Probando lectura de datos...')
  
  try {
    // Leer clubes
    const { data: clubs, error: clubsError } = await supabase
      .from('clubs')
      .select('*')
      .limit(5)
    
    if (clubsError) {
      console.log(`❌ Error leyendo clubes: ${clubsError.message}`)
      return false
    }
    
    console.log(`✅ ${clubs.length} clubes leídos`)
    
    // Leer jugadores
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .limit(5)
    
    if (playersError) {
      console.log(`❌ Error leyendo jugadores: ${playersError.message}`)
      return false
    }
    
    console.log(`✅ ${players.length} jugadores leídos`)
    
    return true
  } catch (error) {
    console.error('❌ Error en lectura:', error.message)
    return false
  }
}

// Función para probar actualización de datos
async function probarActualizacion(clubId) {
  console.log('\n✏️ Probando actualización de datos...')
  
  try {
    const { data, error } = await supabase
      .from('clubs')
      .update({
        name: 'Club de Prueba Actualizado',
        description: 'Club actualizado para pruebas'
      })
      .eq('id', clubId)
      .select()
    
    if (error) {
      console.log(`❌ Error actualizando club: ${error.message}`)
      return false
    }
    
    console.log('✅ Club actualizado correctamente')
    console.log(`📊 Nuevo nombre: ${data[0].name}`)
    
    return true
  } catch (error) {
    console.error('❌ Error en actualización:', error.message)
    return false
  }
}

// Función para probar eliminación de datos
async function probarEliminacion(clubId, playerId) {
  console.log('\n🗑️ Probando eliminación de datos...')
  
  try {
    // Eliminar jugador
    const { error: playerError } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId)
    
    if (playerError) {
      console.log(`❌ Error eliminando jugador: ${playerError.message}`)
      return false
    }
    
    console.log('✅ Jugador eliminado correctamente')
    
    // Eliminar club
    const { error: clubError } = await supabase
      .from('clubs')
      .delete()
      .eq('id', clubId)
    
    if (clubError) {
      console.log(`❌ Error eliminando club: ${clubError.message}`)
      return false
    }
    
    console.log('✅ Club eliminado correctamente')
    
    return true
  } catch (error) {
    console.error('❌ Error en eliminación:', error.message)
    return false
  }
}

// Función para probar autenticación
async function probarAutenticacion() {
  console.log('\n🔐 Probando autenticación...')
  
  try {
    // Intentar registrar un usuario de prueba
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    })
    
    if (signUpError) {
      console.log(`⚠️ Error en registro (puede ser normal): ${signUpError.message}`)
    } else {
      console.log('✅ Usuario registrado correctamente')
    }
    
    // Intentar iniciar sesión
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    })
    
    if (signInError) {
      console.log(`❌ Error en inicio de sesión: ${signInError.message}`)
      return false
    }
    
    console.log('✅ Inicio de sesión exitoso')
    console.log(`👤 Usuario: ${signInData.user.email}`)
    
    // Cerrar sesión
    const { error: signOutError } = await supabase.auth.signOut()
    
    if (signOutError) {
      console.log(`❌ Error cerrando sesión: ${signOutError.message}`)
    } else {
      console.log('✅ Sesión cerrada correctamente')
    }
    
    return true
  } catch (error) {
    console.error('❌ Error en autenticación:', error.message)
    return false
  }
}

// Función para probar almacenamiento
async function probarAlmacenamiento() {
  console.log('\n📁 Probando almacenamiento...')
  
  try {
    // Crear un archivo de prueba
    const testFile = new File(['Contenido de prueba'], 'test.txt', { type: 'text/plain' })
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload('test.txt', testFile)
    
    if (uploadError) {
      console.log(`❌ Error subiendo archivo: ${uploadError.message}`)
      return false
    }
    
    console.log('✅ Archivo subido correctamente')
    console.log(`📁 Ruta: ${uploadData.path}`)
    
    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl('test.txt')
    
    console.log(`🔗 URL pública: ${urlData.publicUrl}`)
    
    // Eliminar archivo de prueba
    const { error: deleteError } = await supabase.storage
      .from('images')
      .remove(['test.txt'])
    
    if (deleteError) {
      console.log(`⚠️ Error eliminando archivo: ${deleteError.message}`)
    } else {
      console.log('✅ Archivo eliminado correctamente')
    }
    
    return true
  } catch (error) {
    console.error('❌ Error en almacenamiento:', error.message)
    return false
  }
}

// Función principal de pruebas
async function probarSupabase() {
  console.log('🧪 Iniciando pruebas de Supabase...\n')
  
  const resultados = {
    insercion: false,
    lectura: false,
    actualizacion: false,
    eliminacion: false,
    autenticacion: false,
    almacenamiento: false
  }
  
  // Probar inserción
  const insercionResult = await probarInsercion()
  resultados.insercion = insercionResult !== false
  
  // Probar lectura
  resultados.lectura = await probarLectura()
  
  // Probar actualización (si la inserción fue exitosa)
  if (insercionResult && insercionResult.clubId) {
    resultados.actualizacion = await probarActualizacion(insercionResult.clubId)
  }
  
  // Probar eliminación (si la inserción fue exitosa)
  if (insercionResult && insercionResult.clubId && insercionResult.playerId) {
    resultados.eliminacion = await probarEliminacion(insercionResult.clubId, insercionResult.playerId)
  }
  
  // Probar autenticación
  resultados.autenticacion = await probarAutenticacion()
  
  // Probar almacenamiento
  resultados.almacenamiento = await probarAlmacenamiento()
  
  console.log('\n📊 RESUMEN DE PRUEBAS:')
  console.log('======================')
  
  for (const [test, resultado] of Object.entries(resultados)) {
    const icono = resultado ? '✅' : '❌'
    const estado = resultado ? 'PASÓ' : 'FALLÓ'
    console.log(`${icono} ${test}: ${estado}`)
  }
  
  const todasPasaron = Object.values(resultados).every(r => r)
  
  if (todasPasaron) {
    console.log('\n🎉 ¡Todas las pruebas pasaron! Supabase está funcionando correctamente.')
  } else {
    console.log('\n⚠️ Algunas pruebas fallaron. Revisa la configuración.')
  }
  
  return todasPasaron
}

// Ejecutar pruebas si estamos en el navegador
if (typeof window !== 'undefined') {
  probarSupabase().then(resultado => {
    if (resultado) {
      console.log('🎯 Supabase está listo para producción')
    } else {
      console.log('🔧 Revisa la configuración de Supabase')
    }
  })
}

export { 
  probarSupabase, 
  probarInsercion, 
  probarLectura, 
  probarActualizacion, 
  probarEliminacion, 
  probarAutenticacion, 
  probarAlmacenamiento 
}
