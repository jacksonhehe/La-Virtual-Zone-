# Limpieza de Caché PWA

## Cuándo limpiar el caché

Es posible que necesites limpiar el caché de la PWA en los siguientes casos:

- Después de actualizar la aplicación
- Si hay problemas con recursos en caché
- Si la aplicación no se actualiza correctamente
- Problemas de sincronización de datos

## Métodos para limpiar el caché

### 1. Desde el navegador (Chrome/Edge)

1. Abre las **Herramientas de desarrollador** (F12)
2. Ve a la pestaña **Application** (Aplicación)
3. En el panel izquierdo, expande **Storage**
4. Haz clic en **Clear storage** (Limpiar almacenamiento)
5. Marca todas las opciones y haz clic en **Clear site data**

### 2. Desde la aplicación

1. Abre la aplicación
2. Mantén presionado **Ctrl + Shift + R** (Windows/Linux) o **Cmd + Shift + R** (Mac)
3. Esto forzará una recarga completa sin caché

### 3. Desde el menú del navegador

1. Haz clic derecho en el ícono de la aplicación
2. Selecciona **Uninstall** (Desinstalar)
3. Vuelve a instalar la aplicación desde el navegador

### 4. Limpiar caché específico de Workbox

```javascript
// En la consola del navegador
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}
```

## Verificar que el caché se limpió

1. Abre las **Herramientas de desarrollador**
2. Ve a **Application** > **Storage**
3. Verifica que **Cache Storage** esté vacío
4. Recarga la página y verifica que se descargan los recursos nuevamente

## Notas importantes

- La limpieza del caché eliminará todos los datos offline
- La aplicación volverá a descargar todos los recursos
- El proceso puede tomar unos minutos dependiendo de la conexión
- Después de limpiar, la aplicación funcionará como si fuera la primera vez 