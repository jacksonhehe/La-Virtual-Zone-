# 🚀 Configuración de Supabase para La Virtual Zone

## 📋 Pasos para Configurar Supabase

### 1. **Configurar Variables de Entorno**

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://zufqbiwbxcnwmrchtiom.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1ZnFiaXdieGNud21yY2h0aW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NzI2NzgsImV4cCI6MjA2OTU0ODY3OH0.CE3Dh3l6XTtS73Akes25wP4wI0n-v9Mlgb4X4ijhaRA

# API Configuration (for backward compatibility)
VITE_API_URL=http://localhost:3000

# App Configuration
VITE_APP_NAME=La Virtual Zone
VITE_APP_VERSION=1.0.0
```

### 2. **Configurar la Base de Datos en Supabase**

1. Ve al panel de administración de Supabase
2. Navega a **SQL Editor**
3. Ejecuta el script `supabase-schema.sql` que está en la raíz del proyecto
4. Esto creará todas las tablas necesarias con las políticas de seguridad

### 3. **Configurar Autenticación**

1. En el panel de Supabase, ve a **Authentication > Settings**
2. Configura las siguientes opciones:
   - **Site URL**: `http://localhost:5173`
   - **Redirect URLs**: `http://localhost:5173/auth/callback`
   - **Enable email confirmations**: Desactivado (para desarrollo)

### 4. **Configurar Almacenamiento**

1. Ve a **Storage** en el panel de Supabase
2. Crea un bucket llamado `images` con las siguientes configuraciones:
   - **Public bucket**: Activado
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/*`

### 5. **Instalar Dependencias**

```bash
npm install @supabase/supabase-js
```

### 6. **Verificar la Configuración**

Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

## 🔧 Estructura de Archivos Creados

### **Servicios de Supabase**
- `src/lib/supabase.ts` - Cliente de Supabase y tipos
- `src/services/supabaseAuth.ts` - Servicio de autenticación
- `src/services/supabaseData.ts` - Servicio de datos
- `src/store/supabaseStore.ts` - Store de Zustand con Supabase

### **Esquema de Base de Datos**
- `supabase-schema.sql` - Script SQL completo

## 📊 Tablas Creadas

### **users**
- `id` (UUID, PK) - Referencia a auth.users
- `email` (TEXT) - Email del usuario
- `username` (TEXT) - Nombre de usuario
- `role` (TEXT) - Rol: ADMIN, CLUB, USER
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### **clubs**
- `id` (SERIAL, PK)
- `name` (TEXT) - Nombre del club
- `slug` (TEXT) - URL amigable
- `logo` (TEXT) - URL del logo
- `founded_year` (INTEGER) - Año de fundación
- `stadium` (TEXT) - Nombre del estadio
- `manager_id` (UUID) - Referencia al DT
- `budget` (INTEGER) - Presupuesto
- `play_style` (TEXT) - Estilo de juego
- `primary_color` (TEXT) - Color primario
- `secondary_color` (TEXT) - Color secundario
- `description` (TEXT) - Descripción del club

### **players**
- `id` (SERIAL, PK)
- `name` (TEXT) - Nombre del jugador
- `age` (INTEGER) - Edad (15-50)
- `nationality` (TEXT) - Nacionalidad
- `dorsal` (INTEGER) - Número de dorsal (1-99)
- `position` (TEXT) - Posición: POR, DEF, MED, DEL
- `club_id` (INTEGER) - Club al que pertenece
- `overall` (INTEGER) - Valoración general (40-99)
- `potential` (INTEGER) - Potencial (40-99)
- `price` (INTEGER) - Valor de mercado
- `image` (TEXT) - URL de la foto
- `contract_expires` (TEXT) - Año de expiración
- `salary` (INTEGER) - Salario mensual

### **matches**
- `id` (SERIAL, PK)
- `home_club_id` (INTEGER) - Club local
- `away_club_id` (INTEGER) - Club visitante
- `home_score` (INTEGER) - Goles local
- `away_score` (INTEGER) - Goles visitante
- `status` (TEXT) - Estado: scheduled, live, finished
- `played_at` (TIMESTAMP) - Fecha del partido

### **transfers**
- `id` (SERIAL, PK)
- `player_id` (INTEGER) - Jugador transferido
- `from_club_id` (INTEGER) - Club origen
- `to_club_id` (INTEGER) - Club destino
- `amount` (INTEGER) - Monto de la transferencia
- `status` (TEXT) - Estado: pending, completed, cancelled

### **news**
- `id` (SERIAL, PK)
- `title` (TEXT) - Título de la noticia
- `content` (TEXT) - Contenido
- `image` (TEXT) - URL de la imagen
- `author_id` (UUID) - Autor de la noticia

## 🔐 Políticas de Seguridad (RLS)

### **Usuarios**
- ✅ Cualquiera puede ver usuarios
- ✅ Usuarios pueden actualizar su propio perfil
- ✅ Usuarios pueden crear su perfil

### **Clubes**
- ✅ Cualquiera puede ver clubes
- ✅ Usuarios autenticados pueden crear clubes
- ✅ DTs pueden actualizar sus clubes
- ✅ Solo admins pueden eliminar clubes

### **Jugadores**
- ✅ Cualquiera puede ver jugadores
- ✅ Usuarios autenticados pueden crear jugadores
- ✅ DTs pueden actualizar jugadores de su club
- ✅ Solo admins pueden eliminar jugadores

### **Partidos**
- ✅ Cualquiera puede ver partidos
- ✅ Usuarios autenticados pueden crear partidos
- ✅ Solo admins pueden actualizar partidos

### **Transferencias**
- ✅ Cualquiera puede ver transferencias
- ✅ Usuarios autenticados pueden crear transferencias
- ✅ Solo admins pueden actualizar transferencias

### **Noticias**
- ✅ Cualquiera puede ver noticias
- ✅ Usuarios autenticados pueden crear noticias
- ✅ Autores pueden actualizar sus noticias
- ✅ Solo admins pueden eliminar noticias

## 🚀 Migración desde el Sistema Actual

### **Paso 1: Actualizar Stores**
Reemplaza los stores actuales con el nuevo `useSupabaseStore`:

```typescript
// Antes
import { useAuthStore } from '../store/authStore'
import { useDataStore } from '../store/dataStore'

// Después
import { useSupabaseStore } from '../store/supabaseStore'
```

### **Paso 2: Actualizar Componentes**
Actualiza los componentes para usar las nuevas funciones:

```typescript
// Antes
const { user, login } = useAuthStore()
const { clubs, fetchClubs } = useDataStore()

// Después
const { user, login, clubs, fetchClubs } = useSupabaseStore()
```

### **Paso 3: Migrar Datos**
Crea un script para migrar los datos existentes a Supabase:

```typescript
// Ejemplo de migración
const migrateData = async () => {
  const oldData = getOldData() // Datos actuales
  const store = useSupabaseStore.getState()
  
  for (const club of oldData.clubs) {
    await store.createClub(club)
  }
  
  for (const player of oldData.players) {
    await store.createPlayer(player)
  }
}
```

## 🎯 Beneficios de Supabase

### **✅ Ventajas**
- **Autenticación robusta** con Supabase Auth
- **Base de datos PostgreSQL** escalable
- **Almacenamiento de archivos** integrado
- **Tiempo real** con suscripciones
- **Políticas de seguridad** granulares
- **Backup automático** y recuperación
- **Panel de administración** completo

### **🔄 Funcionalidades Nuevas**
- **Autenticación social** (Google, Facebook, etc.)
- **Recuperación de contraseña** por email
- **Verificación de email** opcional
- **Sesiones persistentes** automáticas
- **Subida de archivos** directa a Supabase Storage
- **Sincronización en tiempo real** de datos

## 🐛 Solución de Problemas

### **Error de Conexión**
```bash
# Verificar variables de entorno
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### **Error de Autenticación**
1. Verificar que las políticas RLS estén configuradas
2. Comprobar que el usuario esté autenticado
3. Revisar los logs en el panel de Supabase

### **Error de Permisos**
1. Verificar que las políticas de almacenamiento estén configuradas
2. Comprobar que el bucket `images` exista
3. Verificar que el usuario tenga permisos para subir archivos

## 📞 Soporte

Si tienes problemas con la configuración:

1. **Revisa los logs** en el panel de Supabase
2. **Verifica las políticas RLS** en la base de datos
3. **Comprueba las variables de entorno** en el archivo `.env`
4. **Revisa la consola del navegador** para errores de JavaScript

¡Con esto tu aplicación estará 100% conectada a Supabase! 🎉 