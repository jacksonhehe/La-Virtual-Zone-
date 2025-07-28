
Proyecto: AdminPanel - Mercado
--------------------------------
Cambios que acabo de implementar como desarrollador del proyecto:
- Tipado fuerte `Transfer` y eliminación de `any`.
- Sincronización de filtros con la URL + persistencia en localStorage.
- Formateo de moneda con Intl.NumberFormat (EUR).
- Limpieza de imports y `StatsCard` robusto (acepta `icon={Clock}` etc.).
- Reseteo de página al cambiar filtros y guardado de pageSize.

Integración:
1. Copia `src/` dentro de tu repo, sobrescribe archivos existentes.
2. Verifica que `react-router-dom` esté presente (v6).
3. Levanta Vite: `npm run dev`.

Siguientes pasos propuestos (no incluidos aún):
- Undo/rollback de acciones.
- Importación CSV/JSON para altas masivas.
- Virtualización de lista si crece mucho (react-virtual).
