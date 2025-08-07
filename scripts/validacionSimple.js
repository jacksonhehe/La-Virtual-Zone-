// Script simplificado para validar Supabase
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Cargar variables de entorno
dotenv.config()

console.log('🚀 INICIANDO VALIDACIÓN SIMPLIFICADA DE SUPABASE')
console.log('================================================\n')

// Verificar variables de entorno
console.log('📋 PASO 1: Verificando variables de entorno')
console.log('--------------------------------------------')

const variables = {
  'VITE_SUPABASE_URL': process.env.VITE_SUPABASE_URL,
  'VITE_SUPABASE_ANON_KEY': process.env.VITE_SUPABASE_ANON_KEY,
  'VITE_API_URL': process.env.VITE_API_URL,
  'VITE_APP_NAME': process.env.VITE_APP_NAME,
  'VITE_APP_VERSION': process.env.VITE_APP_VERSION
}

let todasConfiguradas = true

for (const [variable, valor] of Object.entries(variables)) {
  if (valor) {
    console.log(`✅ ${variable}: Configurada`)
    if (variable.includes('KEY')) {
      console.log(`   🔑 Valor: ${valor.substring(0, 20)}...`)
    } else {
      console.log(`   📝 Valor: ${valor}`)
    }
  } else {
    console.log(`❌ ${variable}: NO CONFIGURADA`)
    todasConfiguradas = false
  }
}

if (!todasConfiguradas) {
  console.log('\n❌ ERROR: Variables de entorno no configuradas')
  console.log('💡 Crea un archivo .env con las variables necesarias')
  process.exit(1)
}

console.log('\n✅ Variables de entorno configuradas correctamente')

// Crear cliente de Supabase
console.log('\n📋 PASO 2: Creando cliente de Supabase')
console.log('----------------------------------------')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ ERROR: URL o clave de Supabase no configuradas')
  process.exit(1)
}

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
  } else {
    const imagesBucket = data.find(bucket => bucket.name === 'images')
    
    if (imagesBucket) {
      console.log('✅ Bucket "images" encontrado')
      console.log(`📦 Bucket: ${imagesBucket.name}`)
      console.log(`🔒 Público: ${imagesBucket.public}`)
    } else {
      console.log('⚠️ Bucket "images" no encontrado')
      console.log('📋 Buckets disponibles:', data.map(b => b.name))
    }
  }
} catch (error) {
  console.log(`❌ Error en almacenamiento: ${error.message}`)
}

console.log('\n🎉 VALIDACIÓN SIMPLIFICADA COMPLETADA')
console.log('=====================================')
console.log('💡 Revisa los resultados arriba para verificar la configuración')
