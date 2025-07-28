# Mock upgrade (store + seeds + tests)

Este paquete agrega:
- `globalStore.ts` con `activities`, `transfers` con acciones (`approveTransfer`, `rejectTransfer`, `refreshTransfers`, `refreshAll`, `addMockTransfers`), y persistencia en `localStorage`.
- `seed/seedData.ts` con datos de ejemplo.
- `store/selectors.ts` con selectores puros (testeables).
- `__tests__/selectors.test.ts` con pruebas básicas (Vitest).
- `Dashboard.tsx` seguro con *fallbacks* para arrays indefinidos.

## Cómo aplicar
1) Copia el contenido del zip **respetando las rutas** dentro de tu proyecto.
2) Confirma que la importación siga apuntando a `src/adminPanel/store/globalStore`.
3) Inicia el proyecto normalmente.

> Si ya tienes un `globalStore.ts`, este reemplazo es compatible con los usos en `Mercado.tsx` (usa `approveTransfer?`, `rejectTransfer?`, `refreshTransfers?`).

## Tests (opcional)
- Instala Vitest si aún no lo tienes: `npm i -D vitest @types/node`
- Ejecuta: `npx vitest`

