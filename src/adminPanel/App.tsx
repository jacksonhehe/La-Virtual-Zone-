import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SidebarAdmin from './components/SidebarAdmin';

const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Usuarios = lazy(() => import('./pages/admin/Usuarios'));
const Clubes = lazy(() => import('./pages/admin/Clubes'));
const Jugadores = lazy(() => import('./pages/admin/Jugadores'));
const Mercado = lazy(() => import('./pages/admin/Mercado'));
const Torneos = lazy(() => import('./pages/admin/Torneos'));
const Noticias = lazy(() => import('./pages/admin/Noticias'));
const Comentarios = lazy(() => import('./pages/admin/Comentarios'));
const Actividad = lazy(() => import('./pages/admin/Actividad'));
const Estadisticas = lazy(() => import('./pages/admin/Estadisticas'));
const Calendario = lazy(() => import('./pages/admin/Calendario'));

const AdminLayout = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p className="text-gray-400">No tienes permisos para acceder al panel de administración</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <SidebarAdmin />
      <main className="flex-1 md:ml-0">
        <Suspense fallback={
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-700 rounded w-1/4"></div>
              <div className="h-32 bg-gray-700 rounded"></div>
            </div>
          </div>
        }>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="clubes" element={<Clubes />} />
            <Route path="jugadores" element={<Jugadores />} />
            <Route path="mercado" element={<Mercado />} />
            <Route path="torneos" element={<Torneos />} />
            <Route path="noticias" element={<Noticias />} />
            <Route path="comentarios" element={<Comentarios />} />
            <Route path="actividad" element={<Actividad />} />
            <Route path="estadisticas" element={<Estadisticas />} />
            <Route path="calendario" element={<Calendario />} />
            <Route path="*" element={<Navigate to="." replace />} />
          </Routes>
        </Suspense>
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AdminLayout />
      
    </AuthProvider>
  );
}

export default App;
 