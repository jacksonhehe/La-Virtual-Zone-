// Script para validar Supabase con variables directas
import { createClient } from '@supabase/supabase-js'

console.log('🚀 INICIANDO VALIDACIÓN DIRECTA DE SUPABASE')
console.log('===========================================\n')

// Variables de Supabase (hardcodeadas para pruebas)
const supabaseUrl = 'https://zufqbiwbxcnwmrchtiom.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1ZnFiaXdieGNud21yY2h0aW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NzI2NzgsImV4cCI6MjA2OTU0ODY3OH0.CE3Dh3l6XTtS73Akes25wP4wI0n-v9Mlgb4X4ijhaRA'

console.log('📋 PASO 1: Verificando configuración')
console.log('------------------------------------')
console.log(`✅ URL: ${supabaseUrl}`)
console.log(`✅ Key: ${supabaseAnonKey.substring(0, 20)}...`)

// Crear cliente de Supabase
console.log('\n📋 PASO 2: Creando cliente de Supabase')
console.log('----------------------------------------')

const supabase = createClient(supabaseUrl, supabaseAnonKey)
console.log('✅ Cliente de Supabase creado correctamente')

// Probar conexión básica
console.log('\n📋 PASO 3: Probando conexión básica')
console.log('-------------------------------------')

try {
  // Intentar hacer una consulta simple
  const { data, error } = await supabase
    .from('users')
    .select('count')
    .limit(1)
  
  if (error) {
    console.log(`❌ Error en consulta: ${error.message}`)
    console.log('💡 Verifica que las tablas existan en Supabase')
    console.log('💡 Ejecuta el script supabase-schema.sql en el panel de Supabase')
  } else {
    console.log('✅ Conexión a base de datos exitosa')
    console.log(`📊 Datos recibidos: ${JSON.stringify(data)}`)
  }
} catch (error) {
  console.log(`❌ Error de conexión: ${error.message}`)
  console.log('💡 Verifica la URL y clave de Supabase')
}

// Probar autenticación
console.log('\n📋 PASO 4: Probando autenticación')
console.log('-----------------------------------')

try {
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.log(`❌ Error en autenticación: ${error.message}`)
  } else {
    if (session) {
      console.log('✅ Usuario autenticado')
      console.log(`👤 Usuario: ${session.user.email}`)
    } else {
      console.log('ℹ️ No hay sesión activa (normal para pruebas)')
    }
  }
} catch (error) {
  console.log(`❌ Error en autenticación: ${error.message}`)
}

// Probar almacenamiento
console.log('\n📋 PASO 5: Probando almacenamiento')
console.log('-----------------------------------')

try {
  const { data, error } = await supabase.storage.listBuckets()
  
  if (error) {
    console.log(`❌ Error en almacenamiento: ${error.message}`)
    console.log('💡 Verifica que el bucket "images" exista en Supabase Storage')
  } else {
    const imagesBucket = data.find(bucket => bucket.name === 'images')
    
    if (imagesBucket) {
      console.log('✅ Bucket "images" encontrado')
      console.log(`📦 Bucket: ${imagesBucket.name}`)
      console.log(`🔒 Público: ${imagesBucket.public}`)
    } else {
      console.log('⚠️ Bucket "images" no encontrado')
      console.log('📋 Buckets disponibles:', data.map(b => b.name))
      console.log('💡 Crea el bucket "images" en Supabase Storage')
    }
  }
} catch (error) {
  console.log(`❌ Error en almacenamiento: ${error.message}`)
}

// Probar tablas
console.log('\n📋 PASO 6: Probando tablas')
console.log('----------------------------')

const tablas = ['users', 'clubs', 'players', 'matches', 'transfers', 'news']

for (const tabla of tablas) {
  try {
    const { data, error } = await supabase
      .from(tabla)
      .select('*')
      .limit(1)
    
    if (error) {
      console.log(`❌ Tabla "${tabla}": ${error.message}`)
    } else {
      console.log(`✅ Tabla "${tabla}": ${data?.length || 0} registros`)
    }
  } catch (error) {
    console.log(`❌ Tabla "${tabla}": ${error.message}`)
  }
}

console.log('\n🎉 VALIDACIÓN DIRECTA COMPLETADA')
console.log('================================')
console.log('💡 Revisa los resultados arriba para verificar la configuración')
console.log('💡 Si hay errores, sigue las instrucciones en SUPABASE_SETUP.md')
