// Script principal para validación completa de Supabase
import dotenv from 'dotenv'
import { verificarVariablesEntorno } from './verificarVariables.js'
import { validarSupabase } from './validarSupabase.js'
import { probarSupabase } from './probarSupabase.js'

// Cargar variables de entorno
dotenv.config()

// Función principal de validación completa
async function validacionCompleta() {
  console.log('🚀 INICIANDO VALIDACIÓN COMPLETA DE SUPABASE')
  console.log('=============================================\n')
  
  // Paso 1: Verificar variables de entorno
  console.log('📋 PASO 1: Verificando variables de entorno')
  console.log('--------------------------------------------')
  const variablesOk = verificarVariablesEntorno()
  
  if (!variablesOk) {
    console.log('\n❌ ERROR: Variables de entorno no configuradas')
    console.log('💡 Crea un archivo .env con las variables necesarias')
    return false
  }
  
  console.log('\n✅ Variables de entorno configuradas correctamente')
  
  // Paso 2: Validar conexión básica
  console.log('\n📋 PASO 2: Validando conexión básica')
  console.log('--------------------------------------')
  const conexionOk = await validarSupabase()
  
  if (!conexionOk) {
    console.log('\n❌ ERROR: Problemas en la conexión básica')
    console.log('💡 Revisa la URL y clave de Supabase')
    return false
  }
  
  console.log('\n✅ Conexión básica validada correctamente')
  
  // Paso 3: Probar operaciones
  console.log('\n📋 PASO 3: Probando operaciones')
  console.log('--------------------------------')
  const operacionesOk = await probarSupabase()
  
  if (!operacionesOk) {
    console.log('\n❌ ERROR: Problemas en las operaciones')
    console.log('💡 Revisa las políticas RLS y permisos')
    return false
  }
  
  console.log('\n✅ Operaciones validadas correctamente')
  
  // Resumen final
  console.log('\n🎉 VALIDACIÓN COMPLETA EXITOSA')
  console.log('===============================')
  console.log('✅ Variables de entorno: OK')
  console.log('✅ Conexión básica: OK')
  console.log('✅ Operaciones: OK')
  console.log('\n🎯 Supabase está completamente configurado y funcionando')
  
  return true
}

// Función para mostrar instrucciones de configuración
function mostrarInstrucciones() {
  console.log('\n📋 INSTRUCCIONES DE CONFIGURACIÓN')
  console.log('==================================')
  console.log('')
  console.log('1. Crea un archivo .env en la raíz del proyecto')
  console.log('2. Agrega las siguientes variables:')
  console.log('')
  console.log('VITE_SUPABASE_URL=https://zufqbiwbxcnwmrchtiom.supabase.co')
  console.log('VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1ZnFiaXdieGNud21yY2h0aW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NzI2NzgsImV4cCI6MjA2OTU0ODY3OH0.CE3Dh3l6XTtS73Akes25wP4wI0n-v9Mlgb4X4ijhaRA')
  console.log('VITE_API_URL=http://localhost:3000')
  console.log('VITE_APP_NAME=La Virtual Zone')
  console.log('VITE_APP_VERSION=1.0.0')
  console.log('')
  console.log('3. Ejecuta el script de validación:')
  console.log('   npm run validar-supabase')
  console.log('')
  console.log('4. Si hay errores, revisa:')
  console.log('   - Variables de entorno en .env')
  console.log('   - Configuración en el panel de Supabase')
  console.log('   - Políticas RLS en la base de datos')
  console.log('   - Bucket de almacenamiento "images"')
  console.log('')
}

// Función para ejecutar validación con manejo de errores
async function ejecutarValidacion() {
  try {
    const resultado = await validacionCompleta()
    
    if (resultado) {
      console.log('\n🎯 Supabase está listo para usar en la aplicación')
      console.log('💡 Puedes comenzar a usar las funciones de Supabase')
    } else {
      console.log('\n⚠️ Hay problemas en la configuración de Supabase')
      mostrarInstrucciones()
    }
    
    return resultado
  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO:', error.message)
    console.log('\n💡 Revisa la configuración y vuelve a intentar')
    mostrarInstrucciones()
    return false
  }
}

// Ejecutar validación si estamos en el navegador
if (typeof window !== 'undefined') {
  ejecutarValidacion()
}

export { 
  validacionCompleta, 
  ejecutarValidacion, 
  mostrarInstrucciones 
}
