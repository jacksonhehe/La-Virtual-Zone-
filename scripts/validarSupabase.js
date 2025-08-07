// Script para validar la conexión a Supabase
import { supabase } from './supabaseClient.js'

// Función para validar la conexión básica
async function validarConexionBasica() {
  console.log('🔍 Validando conexión básica a Supabase...')
  
  try {
    // Verificar que las variables de entorno estén configuradas
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('❌ Variables de entorno de Supabase no configuradas')
    }
    
    console.log('✅ Variables de entorno configuradas')
    console.log(`📡 URL: ${url}`)
    console.log(`🔑 Key: ${key.substring(0, 20)}...`)
    
    // Verificar que el cliente se pueda crear
    if (!supabase) {
      throw new Error('❌ No se pudo crear el cliente de Supabase')
    }
    
    console.log('✅ Cliente de Supabase creado correctamente')
    
    return true
  } catch (error) {
    console.error('❌ Error en conexión básica:', error.message)
    return false
  }
}

// Función para validar la base de datos
async function validarBaseDeDatos() {
  console.log('\n🗄️ Validando base de datos...')
  
  try {
    // Intentar hacer una consulta simple
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      throw new Error(`Error en consulta: ${error.message}`)
    }
    
    console.log('✅ Conexión a base de datos exitosa')
    console.log(`📊 Datos recibidos: ${JSON.stringify(data)}`)
    
    return true
  } catch (error) {
    console.error('❌ Error en base de datos:', error.message)
    return false
  }
}

// Función para validar autenticación
async function validarAutenticacion() {
  console.log('\n🔐 Validando autenticación...')
  
  try {
    // Verificar el estado actual de autenticación
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw new Error(`Error en autenticación: ${error.message}`)
    }
    
    if (session) {
      console.log('✅ Usuario autenticado')
      console.log(`👤 Usuario: ${session.user.email}`)
    } else {
      console.log('ℹ️ No hay sesión activa (normal para pruebas)')
    }
    
    return true
  } catch (error) {
    console.error('❌ Error en autenticación:', error.message)
    return false
  }
}

// Función para validar almacenamiento
async function validarAlmacenamiento() {
  console.log('\n📁 Validando almacenamiento...')
  
  try {
    // Verificar que el bucket 'images' existe
    const { data, error } = await supabase.storage.listBuckets()
    
    if (error) {
      throw new Error(`Error en almacenamiento: ${error.message}`)
    }
    
    const imagesBucket = data.find(bucket => bucket.name === 'images')
    
    if (imagesBucket) {
      console.log('✅ Bucket "images" encontrado')
      console.log(`📦 Bucket: ${imagesBucket.name}`)
      console.log(`🔒 Público: ${imagesBucket.public}`)
    } else {
      console.log('⚠️ Bucket "images" no encontrado')
      console.log('📋 Buckets disponibles:', data.map(b => b.name))
    }
    
    return true
  } catch (error) {
    console.error('❌ Error en almacenamiento:', error.message)
    return false
  }
}

// Función para validar tablas
async function validarTablas() {
  console.log('\n📋 Validando tablas...')
  
  const tablas = ['users', 'clubs', 'players', 'matches', 'transfers', 'news']
  const resultados = {}
  
  for (const tabla of tablas) {
    try {
      const { data, error } = await supabase
        .from(tabla)
        .select('*')
        .limit(1)
      
      if (error) {
        resultados[tabla] = { success: false, error: error.message }
      } else {
        resultados[tabla] = { success: true, count: data?.length || 0 }
      }
    } catch (error) {
      resultados[tabla] = { success: false, error: error.message }
    }
  }
  
  // Mostrar resultados
  for (const [tabla, resultado] of Object.entries(resultados)) {
    if (resultado.success) {
      console.log(`✅ Tabla "${tabla}": ${resultado.count} registros`)
    } else {
      console.log(`❌ Tabla "${tabla}": ${resultado.error}`)
    }
  }
  
  return Object.values(resultados).every(r => r.success)
}

// Función para validar políticas RLS
async function validarPoliticasRLS() {
  console.log('\n🔒 Validando políticas RLS...')
  
  try {
    // Intentar hacer operaciones que requieren políticas específicas
    const operaciones = [
      { nombre: 'Lectura pública', operacion: () => supabase.from('clubs').select('*').limit(1) },
      { nombre: 'Lectura de jugadores', operacion: () => supabase.from('players').select('*').limit(1) },
      { nombre: 'Lectura de partidos', operacion: () => supabase.from('matches').select('*').limit(1) }
    ]
    
    for (const op of operaciones) {
      try {
        const { data, error } = await op.operacion()
        
        if (error) {
          console.log(`⚠️ ${op.nombre}: ${error.message}`)
        } else {
          console.log(`✅ ${op.nombre}: Permitido`)
        }
      } catch (error) {
        console.log(`❌ ${op.nombre}: ${error.message}`)
      }
    }
    
    return true
  } catch (error) {
    console.error('❌ Error validando políticas RLS:', error.message)
    return false
  }
}

// Función principal de validación
async function validarSupabase() {
  console.log('🚀 Iniciando validación completa de Supabase...\n')
  
  const resultados = {
    conexionBasica: await validarConexionBasica(),
    baseDeDatos: await validarBaseDeDatos(),
    autenticacion: await validarAutenticacion(),
    almacenamiento: await validarAlmacenamiento(),
    tablas: await validarTablas(),
    politicasRLS: await validarPoliticasRLS()
  }
  
  console.log('\n📊 RESUMEN DE VALIDACIÓN:')
  console.log('========================')
  
  for (const [test, resultado] of Object.entries(resultados)) {
    const icono = resultado ? '✅' : '❌'
    const estado = resultado ? 'PASÓ' : 'FALLÓ'
    console.log(`${icono} ${test}: ${estado}`)
  }
  
  const todosPasaron = Object.values(resultados).every(r => r)
  
  if (todosPasaron) {
    console.log('\n🎉 ¡Todas las validaciones pasaron! Supabase está configurado correctamente.')
  } else {
    console.log('\n⚠️ Algunas validaciones fallaron. Revisa la configuración.')
  }
  
  return todosPasaron
}

// Ejecutar validación si estamos en el navegador
if (typeof window !== 'undefined') {
  validarSupabase().then(resultado => {
    if (resultado) {
      console.log('🎯 Supabase está listo para usar')
    } else {
      console.log('🔧 Revisa la configuración de Supabase')
    }
  })
}

export { 
  validarSupabase, 
  validarConexionBasica, 
  validarBaseDeDatos, 
  validarAutenticacion, 
  validarAlmacenamiento, 
  validarTablas, 
  validarPoliticasRLS 
}
