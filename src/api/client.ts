import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default axios.create({
  baseURL: API,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
export const apiClient = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de respuesta para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o no válido
      console.warn('Sesión expirada o no válida');
      // Aquí podrías redirigir al login o refrescar el token
    }
    return Promise.reject(error);
  }
);

export { API }; 