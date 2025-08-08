import axios from 'axios';

// Un dominio: por defecto usa mismo origen donde se sirve el SPA/backend
const sameOrigin = typeof window !== 'undefined' ? window.location.origin : '';
const API = import.meta.env.VITE_API_URL || sameOrigin || 'http://localhost:3000';

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
      console.warn('Sesión expirada o no válida');
    }
    return Promise.reject(error);
  }
);

export { API };