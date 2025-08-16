# 🚀 Mejoras del Mercado de Fichajes - La Virtual Zone

## 📋 Resumen de Funcionalidades Implementadas

Este documento describe las mejoras implementadas en el sistema de mercado de fichajes de La Virtual Zone, incluyendo notificaciones, vencimiento de ofertas, y mejor gestión del estado del mercado.

## ✨ Nuevas Funcionalidades

### 1. 🏪 Banner de Estado del Mercado
- **Archivo**: `src/components/common/MarketBanner.tsx`
- **Funcionalidad**: Muestra el estado actual del mercado (abierto/cerrado) con contador de cierre
- **Características**:
  - Indicador visual del estado del mercado
  - Contador regresivo hasta el cierre (si está configurado)
  - Mensaje de bloqueo cuando está cerrado
  - Integración automática en el dashboard del DT

### 2. 🔔 Sistema de Notificaciones
- **Store**: `src/store/notificationStore.ts`
- **Componente**: `src/components/notifications/NotificationBell.tsx`
- **Funcionalidad**: Sistema completo de notificaciones en tiempo real
- **Tipos de notificaciones**:
  - `offer_received`: Nueva oferta recibida
  - `offer_accepted`: Oferta aceptada
  - `offer_rejected`: Oferta rechazada
  - `offer_expired`: Oferta expirada
  - `market_opened`: Mercado abierto
  - `market_closed`: Mercado cerrado

### 3. ⏰ Ofertas con Vencimiento
- **Archivo**: `src/utils/transferService.ts`
- **Funcionalidad**: Sistema automático de vencimiento de ofertas
- **Características**:
  - Vencimiento automático a las 48 horas (configurable)
  - Verificación automática cada 5 minutos
  - Estado `expired` para ofertas vencidas
  - Notificaciones automáticas de expiración

### 4. 🔒 Control de Permisos Mejorado
- **Archivo**: `src/components/market/OffersPanel.tsx`
- **Funcionalidad**: Solo los DT del club vendedor pueden responder ofertas
- **Características**:
  - Validación de permisos por club
  - Botones ocultos para usuarios sin permisos
  - Mensajes claros de restricciones

### 5. 🏷️ Filtro de Jugadores Transferibles
- **Archivo**: `src/components/dt-dashboard/MercadoTab.tsx`
- **Funcionalidad**: Filtro para mostrar solo jugadores transferibles
- **Características**:
  - Switch "Solo transferibles"
  - Chip visual "No transferible" en jugadores bloqueados
  - Botones deshabilitados para jugadores no transferibles

### 6. 🛠️ Botón de Reset para Desarrollo
- **Archivo**: `src/components/admin/DevResetButton.tsx`
- **Funcionalidad**: Limpieza completa de datos para pruebas
- **Características**:
  - Solo visible para admins o en modo desarrollo
  - Limpia localStorage, sessionStorage y stores
  - Recarga automática de la página
  - Confirmación de seguridad

### 7. ⚙️ Configuración Centralizada
- **Archivo**: `src/config/marketConfig.ts`
- **Funcionalidad**: Configuración centralizada del mercado
- **Parámetros configurables**:
  - Tiempo de vencimiento de ofertas
  - Intervalo de verificación
  - Porcentajes mínimos/máximos de oferta
  - Tamaño mínimo de plantilla

## 🔧 Instalación y Configuración

### 1. Dependencias Requeridas
```bash
npm install date-fns
```

### 2. Configuración del Mercado
El mercado se puede configurar desde el panel de administración:
- **Abrir/Cerrar mercado**: Botón principal en el panel admin
- **Fecha de cierre automático**: Se establece automáticamente al abrir (48 horas)
- **Configuración de vencimiento**: Editable en `src/config/marketConfig.ts`

### 3. Variables de Entorno
```bash
# Modo desarrollo (muestra botón de reset)
NODE_ENV=development
```

## 📱 Uso de las Funcionalidades

### Para Directores Técnicos (DT)
1. **Ver estado del mercado**: Banner visible en el dashboard
2. **Filtrar jugadores**: Usar switch "Solo transferibles"
3. **Gestionar ofertas**: Panel separado de ofertas enviadas/recibidas
4. **Notificaciones**: Campanita en la barra de navegación

### Para Administradores
1. **Control del mercado**: Panel de administración del mercado
2. **Configurar fechas**: Establecer fechas de cierre automático
3. **Monitoreo**: Estadísticas en tiempo real del mercado
4. **Reset de datos**: Botón de limpieza para desarrollo

## 🔍 Estructura de Archivos

```
src/
├── components/
│   ├── common/
│   │   └── MarketBanner.tsx          # Banner del mercado
│   ├── notifications/
│   │   └── NotificationBell.tsx       # Campanita de notificaciones
│   ├── market/
│   │   └── OffersPanel.tsx            # Panel de ofertas mejorado
│   ├── dt-dashboard/
│   │   └── MercadoTab.tsx             # Tab del mercado con filtros
│   └── admin/
│       └── DevResetButton.tsx         # Botón de reset
├── store/
│   └── notificationStore.ts           # Store de notificaciones
├── hooks/
│   └── useExpiredOffers.ts            # Hook de verificación automática
├── config/
│   └── marketConfig.ts                # Configuración del mercado
└── utils/
    └── transferService.ts             # Servicio de transferencias mejorado
```

## 🚨 Solución de Problemas

### Problema: Ofertas no se marcan como expiradas
**Solución**: Verificar que el hook `useExpiredOffers` esté activo en `App.tsx`

### Problema: Notificaciones no aparecen
**Solución**: Verificar que `NotificationBell` esté integrado en `Navbar.tsx`

### Problema: Datos corruptos en localStorage
**Solución**: Usar el botón "Reset Dev" o ejecutar `localStorage.clear()` manualmente

### Problema: Mercado no respeta fechas de cierre
**Solución**: Verificar configuración en `marketConfig.ts` y admin panel

## 🔄 Flujo de Trabajo del Mercado

1. **Admin abre mercado** → Se establece fecha de cierre automático
2. **DT hace oferta** → Se crea con vencimiento de 48 horas
3. **Sistema verifica** → Cada 5 minutos verifica ofertas expiradas
4. **Notificaciones** → Se envían automáticamente para eventos importantes
5. **Cierre automático** → Mercado se cierra al alcanzar la fecha límite

## 📊 Estados de las Ofertas

- **`pending`**: Oferta activa, esperando respuesta
- **`accepted`**: Oferta aceptada, jugador transferido
- **`rejected`**: Oferta rechazada por el club vendedor
- **`expired`**: Oferta vencida automáticamente

## 🔐 Seguridad y Validaciones

- **Permisos**: Solo DT del club vendedor puede responder ofertas
- **Validaciones**: Presupuesto, plantilla mínima, propiedad del jugador
- **Duplicados**: Prevención de ofertas múltiples del mismo comprador
- **Mercado cerrado**: Bloqueo total de operaciones cuando está cerrado

## 🎯 Próximas Mejoras Sugeridas

1. **Sistema de subastas** para jugadores premium
2. **Historial de transferencias** con estadísticas
3. **Notificaciones push** para eventos críticos
4. **API REST** para integración externa
5. **Dashboard de analytics** del mercado

## 📞 Soporte

Para problemas o consultas sobre estas funcionalidades:
1. Revisar este documento
2. Verificar la consola del navegador
3. Usar el botón "Reset Dev" si hay corrupción de datos
4. Contactar al equipo de desarrollo

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024  
**Compatibilidad**: React 18+, TypeScript 5+, Tailwind CSS 3+

