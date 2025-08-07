// Script para verificar las variables de entorno de Supabase
function verificarVariablesEntorno() {
  console.log('🔍 Verificando variables de entorno de Supabase...\n')
  
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
  
  console.log('\n📋 CONFIGURACIÓN REQUERIDA:')
  console.log('============================')
  console.log('Crea un archivo .env en la raíz del proyecto con:')
  console.log('')
  console.log('VITE_SUPABASE_URL=https://zufqbiwbxcnwmrchtiom.supabase.co')
  console.log('VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1ZnFiaXdieGNud21yY2h0aW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NzI2NzgsImV4cCI6MjA2OTU0ODY3OH0.CE3Dh3l6XTtS73Akes25wP4wI0n-v9Mlgb4X4ijhaRA')
  console.log('VITE_API_URL=http://localhost:3000')
  console.log('VITE_APP_NAME=La Virtual Zone')
  console.log('VITE_APP_VERSION=1.0.0')
  console.log('')
  
  if (todasConfiguradas) {
    console.log('🎉 Todas las variables están configuradas correctamente')
  } else {
    console.log('⚠️ Algunas variables no están configuradas')
  }
  
  return todasConfiguradas
}

// Ejecutar verificación si estamos en el navegador
if (typeof window !== 'undefined') {
  verificarVariablesEntorno()
}

export { verificarVariablesEntorno }
