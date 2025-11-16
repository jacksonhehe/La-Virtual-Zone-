import  { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/common/LoadingScreen';
import AuthErrorBanner from './components/auth/AuthErrorBanner';
import AccountStatusRedirect from './components/auth/AccountStatusRedirect';
import { useAuthStore } from './store/authStore';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const RecoverPassword = lazy(() => import('./pages/RecoverPassword'));
const UserPanel = lazy(() => import('./pages/UserPanel'));
const LigaMaster = lazy(() => import('./pages/LigaMaster'));
const Market = lazy(() => import('./pages/Market'));
const Tournaments = lazy(() => import('./pages/Tournaments'));
const TournamentDetail = lazy(() => import('./pages/TournamentDetail'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Help = lazy(() => import('./pages/Help'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminTournaments = lazy(() => import('./pages/admin/Tournaments'));
const AdminMatches = lazy(() => import('./pages/admin/Matches'));
const AdminNews = lazy(() => import('./pages/admin/News'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminClubs = lazy(() => import('./pages/admin/Clubs'));
const AdminPlayers = lazy(() => import('./pages/admin/Players'));
const AdminMarket = lazy(() => import('./pages/admin/Market'));
const AdminStats = lazy(() => import('./pages/admin/Stats'));
const AdminCalendar = lazy(() => import('./pages/admin/Calendar'));
// TODO: add other admin sections lazily as they are split
const UserProfile = lazy(() => import('./pages/UserProfile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ClubProfile = lazy(() => import('./pages/ClubProfile'));
const ClubSquad = lazy(() => import('./pages/ClubSquad'));
const ClubFinances = lazy(() => import('./pages/ClubFinances'));
const ClubPalmares = lazy(() => import('./pages/ClubPalmares'));
const HallOfFame = lazy(() => import('./pages/HallOfFame'));
const Rankings = lazy(() => import('./pages/Rankings'));
const Fixtures = lazy(() => import('./pages/Fixtures'));
const MarketTables = lazy(() => import('./pages/MarketTables'));
const Zones = lazy(() => import('./pages/Zones'));
const Users = lazy(() => import('./pages/Users'));
const DtCommunity = lazy(() => import('./pages/DtCommunity'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const AccountStatus = lazy(() => import('./pages/AccountStatus'));
const Reglamento = lazy(() => import('./pages/Reglamento'));

function App() {
  const { isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Show loading screen during auth initialization
  if (isLoading) {
    return <LoadingScreen message="Verificando sesión..." />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <AuthErrorBanner />
      <AccountStatusRedirect />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="cuenta-suspendida" element={<AccountStatus />} />
          <Route path="registro" element={<Register />} />
          <Route path="recuperar-password" element={<RecoverPassword />} />
          <Route path="usuario" element={<UserPanel />} />
          
          {/* Liga Master routes */}
          <Route path="liga-master">
            <Route index element={<LigaMaster />} />
            <Route path="reglamento" element={<Reglamento />} />
            <Route path="mercado" element={<Market />} />
            <Route path="tablas-mercado" element={<MarketTables />} />
            <Route path="club/:clubName" element={<ClubProfile />} />
            <Route path="club/:clubName/plantilla" element={<ClubSquad />} />
            <Route path="club/:clubName/finanzas" element={<ClubFinances />} />
            <Route path="club/:clubName/palmares" element={<ClubPalmares />} />
            <Route path="hall-of-fame" element={<HallOfFame />} />
            <Route path="rankings" element={<Rankings />} />
            <Route path="fixture" element={<Fixtures />} />
            <Route path="zonas" element={<Zones />} />
            <Route path="comunidad-dt" element={<DtCommunity />} />
          </Route>
          
          {/* Tournaments routes */}
          <Route path="torneos">
            <Route index element={<Tournaments />} />
            <Route path=":tournamentId" element={<TournamentDetail />} />
          </Route>
          
          {/* Blog routes */}
          <Route path="blog">
            <Route index element={<Blog />} />
            <Route path=":postId" element={<BlogPost />} />
          </Route>
          
          {/* Other routes */}
          <Route path="galeria" element={<Gallery />} />
          <Route path="ayuda" element={<Help />} />
          <Route path="terminos" element={<Terms />} />
          <Route path="privacidad" element={<Privacy />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="torneos" element={<AdminTournaments />} />
            <Route path="partidos" element={<AdminMatches />} />
            <Route path="noticias" element={<AdminNews />} />
            <Route path="usuarios" element={<AdminUsers />} />
            <Route path="clubes" element={<AdminClubs />} />
            <Route path="jugadores" element={<AdminPlayers />} />
            <Route path="mercado" element={<AdminMarket />} />
            <Route path="estadisticas" element={<AdminStats />} />
            <Route path="calendario" element={<AdminCalendar />} />
          </Route>
          <Route path="usuarios" element={<Users />} />
          <Route path="usuarios/:username" element={<UserProfile />} />

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
 
