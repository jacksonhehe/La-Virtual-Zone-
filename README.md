# SmartAvatar patch

**Qué arregla**
Corrige el error `SmartAvatar is not defined` en `Navbar.tsx` añadiendo el componente y el import correspondiente.

**Archivos incluidos**
- `src/components/common/SmartAvatar.tsx`

**Qué debes hacer**
1) Copia `src/components/common/SmartAvatar.tsx` dentro de tu proyecto.
2) Abre `src/components/Layout/Navbar.tsx` y agrega este import en el tope del archivo:

```ts
import SmartAvatar from "../common/SmartAvatar";
```

(La ruta es desde `Layout/Navbar.tsx` hacia `components/common/SmartAvatar.tsx`. Si tu estructura difiere, ajusta la ruta.)

3) Asegúrate de tener una imagen por defecto en `public/default-avatar.png` (opcional). Si no existe, el componente mostrará iniciales en un círculo.
4) Guarda los cambios y reinicia `vite` si no se refresca solo.
