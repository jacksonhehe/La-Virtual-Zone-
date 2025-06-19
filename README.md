# La Virtual Zone

Proyecto base para **La Virtual Zone** usando React, Vite y TypeScript. Incluye un diseño oscuro con fuentes gamer para una apariencia profesional.

## Requisitos

- Node.js 18 o superior.

## Desarrollo

Instala las dependencias y levanta el servidor de desarrollo:

```bash
npm install
npm run dev
```

El servidor de desarrollo se inicia en el puerto `5173`.

## Otras tareas

Ejecuta el linting del proyecto:

```bash
npm run lint
```

Construye la aplicación para producción:

```bash
npm run build
```

Y luego visualiza el resultado con:

```bash
npm run preview
```

## Personalizar colores

La paleta usada por Tailwind está definida mediante variables CSS en
`src/index.css`. Puedes cambiarla editando los valores dentro del selector
`:root`:

```css
:root {
  --bg: #0d0d0d;
  --card: #171717;
  --text: #eaeaea;
  --primary: #00e0ff;
  --accent: #9f7aea;
  /* ... */
}
```

Al modificar estas variables se actualizarán automáticamente las utilidades de
Tailwind que las usan.

