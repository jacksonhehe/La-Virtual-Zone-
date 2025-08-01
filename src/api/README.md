# Cliente API Centralizado

Este directorio contiene el cliente API centralizado para la aplicación.

## Archivos

- `client.ts` - Cliente Axios configurado con la variable de entorno `VITE_API_URL`

## Uso

### Importar el cliente

```typescript
import apiClient from '@/api/client';
// o
import { apiClient, API } from '@/api/client';
```

### Ejemplos de uso

```typescript
// GET request
const response = await apiClient.get('/auth/profile');

// POST request
const response = await apiClient.post('/auth/login', {
  email: 'user@example.com',
  password: 'password'
});

// PUT request
const response = await apiClient.put('/users/123', {
  username: 'newUsername'
});

// DELETE request
const response = await apiClient.delete('/users/123');
```

### Configuración

El cliente está configurado automáticamente con:

- `baseURL`: Usa `VITE_API_URL` del archivo `.env`
- `withCredentials: true`: Para incluir cookies en las peticiones
- `Content-Type: application/json`: Headers por defecto
- Interceptor para manejar errores 401 (sesión expirada)

### Variables de entorno

Asegúrate de tener en tu archivo `.env`:

```
VITE_API_URL=http://localhost:3000
```

## Migración desde URLs hardcodeadas

Si tienes código que usa URLs hardcodeadas, reemplázalo:

```typescript
// ❌ Antes
fetch('http://localhost:3000/api/users')

// ✅ Después
import apiClient from '@/api/client';
apiClient.get('/api/users')
``` 