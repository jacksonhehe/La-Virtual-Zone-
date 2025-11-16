/**
 * Configuración de la aplicación para modo híbrido (IndexedDB + Supabase)
 */

export const config = {
  // Modo Supabase - cambiar a true cuando esté listo
  useSupabase: import.meta.env.VITE_USE_SUPABASE === 'true' || false,

  // Configuración de Supabase
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  },

  // Configuración de IndexedDB
  indexedDB: {
    name: 'VirtualZoneDB',
    version: 2,
  },

  // Configuración de sincronización
  sync: {
    // Intervalo de sincronización automática (en minutos)
    intervalMinutes: 5,

    // Número máximo de reintentos de sincronización
    maxRetries: 3,

    // Timeout para operaciones de red (en segundos)
    timeoutSeconds: 30,
  },

  // Configuración de desarrollo
  development: {
    // Habilitar logs detallados
    enableDetailedLogs: import.meta.env.DEV,

    // Habilitar modo offline forzado
    forceOffline: false,
  },
}

// Validar configuración crítica
export const validateConfig = () => {
  if (config.useSupabase) {
    if (!config.supabase.url || !config.supabase.anonKey) {
      console.warn('⚠️ Supabase está habilitado pero faltan variables de entorno')
      console.warn('VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY son requeridos')
      return false
    }
  }

  return true
}

// Función para alternar modo Supabase (útil para desarrollo)
export const toggleSupabaseMode = (enabled: boolean) => {
  config.useSupabase = enabled
  localStorage.setItem('virtual_zone_use_supabase', enabled.toString())
  console.log(`🔄 Modo Supabase: ${enabled ? 'HABILITADO' : 'DESHABILITADO'}`)
}

// Cargar configuración persistente
const savedMode = localStorage.getItem('virtual_zone_use_supabase')
if (savedMode !== null) {
  config.useSupabase = savedMode === 'true'
}

// Validar configuración al cargar
if (typeof window !== 'undefined') {
  validateConfig()
}
