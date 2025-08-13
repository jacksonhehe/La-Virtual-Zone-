import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster, toast } from 'react-hot-toast';
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
const Store = lazy(() => import('./pages/admin/Store'));
const Economy = lazy(() => import('./pages/admin/Economy'));
const Calendario = lazy(() => import('./pages/admin/Calendario'));

const AdminLayout = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    toast.error('Acceso denegado');
    return <Navigate to="/403" replace />;
  }

  return (
    <div className="min-h-screen admin-bg flex">
      <SidebarAdmin />
      <main className="flex-1 md:ml-0 admin-main-content">
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
            <Route path="store" element={<Store />} />
            <Route path="economy" element={<Economy />} />
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
 