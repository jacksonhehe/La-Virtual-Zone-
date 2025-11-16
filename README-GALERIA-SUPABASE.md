# 🚀 Integración de Galería con Supabase

La galería de La Virtual Zone ahora está completamente integrada con Supabase para almacenamiento en la nube de imágenes y datos.

> **⚠️ Si ves el error "new row violates row-level security policy":**
> Ejecuta primero el script `supabase-dev-policies.sql` en Supabase SQL Editor

## ✅ Funcionalidades Implementadas

### **Almacenamiento Híbrido**
- **Modo Supabase activado**: Imágenes se suben a Supabase Storage, datos se sincronizan con Supabase
- **Modo local**: Funciona sin Supabase usando localStorage (modo fallback)

### **Características**
- ✅ Subida automática de **imágenes y videos** a Supabase Storage
- ✅ Sincronización bidireccional de datos
- ✅ URLs públicas para contenido multimedia
- ✅ Validación de archivos (tipo, tamaño: imágenes hasta 10MB, videos hasta 50MB)
- ✅ Vista previa antes de subir
- ✅ Indicadores de carga y estado
- ✅ Manejo de errores robusto
- ✅ Soporte completo para clips, videos e imágenes

## 🛠️ Configuración de Supabase

### **1. Crear Tabla de Base de Datos**

Ejecuta el script `supabase-media-table.sql` en el **SQL Editor** de Supabase:

```sql
-- El script está en supabase-media-table.sql
-- Crea la tabla 'media' con todos los campos necesarios
```

### **2. Políticas de Desarrollo (Obligatorio para probar)**

Ejecuta el script `supabase-dev-policies.sql` para políticas permisivas:

```sql
-- El script está en supabase-dev-policies.sql
-- Permite subida de archivos sin autenticación durante desarrollo
```

> **⚠️ Importante**: Ejecuta primero `supabase-media-table.sql` y luego `supabase-dev-policies.sql`

### **3. Crear Bucket de Storage**

1. Ve a **Storage** en el panel de Supabase
2. Crea un nuevo bucket llamado `media`
3. Configura como **público** (public bucket)
4. Configura límite de tamaño: **50MB** (para permitir videos grandes)
5. Tipos MIME permitidos: `image/*, video/*`

### **4. Variables de Entorno**

Asegúrate de tener estas variables configuradas:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_USE_SUPABASE=true
```

### **5. Políticas de Seguridad (RLS)**

#### **Para Producción (Usuarios Autenticados)**
Configura las políticas RLS para la tabla `media`:

```sql
-- Permitir lectura pública
CREATE POLICY "Media is viewable by everyone" ON media
  FOR SELECT USING (true);

-- Permitir inserción para usuarios autenticados
CREATE POLICY "Users can insert media" ON media
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir actualización solo al uploader
CREATE POLICY "Users can update own media" ON media
  FOR UPDATE USING (auth.uid()::text = uploader);
```

#### **Para Desarrollo (Subida sin Autenticación)**
Si no tienes autenticación implementada aún, usa estas políticas más permisivas:

```sql
-- Políticas permisivas para desarrollo
CREATE POLICY "Allow public access to media table" ON media
  FOR ALL USING (true) WITH CHECK (true);

-- Políticas permisivas para el bucket de storage
CREATE POLICY "Allow public upload to media bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media');

CREATE POLICY "Allow public access to media bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Allow public update to media bucket" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media');

CREATE POLICY "Allow public delete to media bucket" ON storage.objects
  FOR DELETE USING (bucket_id = 'media');
```

## 📱 Cómo Funciona

### **Flujo de Subida**
1. **Usuario selecciona imagen/video** → Validación local (tipo y tamaño)
2. **Si Supabase activado** → Sube a Storage + guarda metadata en DB
3. **Si modo local** → Convierte a base64 + guarda en localStorage
4. **Sincronización automática** → Datos se mantienen en ambos lugares

### **Estados de la UI**
- 🔄 **Subiendo archivo...** - Procesando imagen o video
- ☁️ **En la nube** - Archivo en Supabase Storage
- 💾 **Guardado local** - Archivo en localStorage
- 🎬 **Video** / 🖼️ **Imagen** - Indicadores de tipo de contenido

### **Manejo de Errores**
- Fallback automático si Supabase falla
- Mensajes de error descriptivos
- Reintentos automáticos en algunos casos

## 🎯 Archivos Modificados

### **Nuevos Archivos**
- `src/utils/supabaseStorage.ts` - Servicio de subida a Storage
- `src/utils/supabaseMediaSync.ts` - Servicio de sincronización
- `supabase-media-table.sql` - Script SQL para crear tabla

### **Archivos Actualizados**
- `src/lib/supabase.ts` - Tipos TypeScript para tabla media
- `src/store/slices/mediaSlice.ts` - Lógica híbrida Supabase/local
- `src/store/dataStore.ts` - Inicialización de media
- `src/pages/Gallery.tsx` - UI actualizada con indicadores de carga

## 🔧 Configuración Avanzada

### **Alternar Modo Supabase**
```javascript
// Desde la consola del navegador
window.dataStore.config.useSupabase = true; // Activar
window.dataStore.config.useSupabase = false; // Desactivar
```

### **Sincronización Manual**
```javascript
// Forzar sincronización
await window.dataStore.syncMediaItems();
```

## 🐛 Solución de Problemas

### **❌ Error: "new row violates row-level security policy"**

**Solución inmediata:**
Ejecuta el script `supabase-dev-policies.sql` en el SQL Editor de Supabase:

```sql
-- Ejecuta este script completo en Supabase SQL Editor
-- Está en el archivo supabase-dev-policies.sql
```

**Qué hace este script:**
- ✅ Crea políticas permisivas para la tabla `media`
- ✅ Crea políticas permisivas para el bucket `media` de storage
- ✅ Permite subida sin autenticación durante desarrollo

### **Problema: Imágenes no se suben**
- Verifica que el bucket `media` existe y es público
- Revisa las variables de entorno (`VITE_SUPABASE_*`)
- Verifica que ejecutaste `supabase-dev-policies.sql`
- Verifica permisos de Storage

### **Problema: Datos no se sincronizan**
- Verifica conexión a internet
- Revisa configuración de RLS (asegúrate de que `supabase-dev-policies.sql` se ejecutó)
- Verifica que la tabla `media` existe
- Revisa la consola del navegador por errores

### **Problema: Fallback no funciona**
- Verifica que localStorage esté disponible
- Revisa configuración del navegador
- Verifica que `VITE_USE_SUPABASE=false` funcione como fallback

## 🎉 ¡Listo!

La galería ahora está completamente integrada con Supabase. Los usuarios pueden subir imágenes que se almacenan en la nube y se sincronizan automáticamente. El sistema es robusto y tiene fallbacks automáticos para garantizar que siempre funcione.
