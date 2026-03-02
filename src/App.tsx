import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LoadingScreen from './components/common/LoadingScreen';
import AuthErrorBanner from './components/auth/AuthErrorBanner';
import AccountStatusRedirect from './components/auth/AccountStatusRedirect';
import { useAuthStore } from './store/authStore';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const RecoverPassword = lazy(() => import('./pages/auth/RecoverPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const UserPanel = lazy(() => import('./pages/UserPanel'));
const LigaMaster = lazy(() => import('./pages/liga-master/LigaMaster'));
const Market = lazy(() => import('./pages/liga-master/Market'));
const Tournaments = lazy(() => import('./pages/tournaments/Tournaments'));
const TournamentDetail = lazy(() => import('./pages/tournaments/TournamentDetail'));
const Blog = lazy(() => import('./pages/blog/Blog'));
const BlogPost = lazy(() => import('./pages/blog/BlogPost'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Help = lazy(() => import('./pages/legal/Help'));
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
const UserProfile = lazy(() => import('./pages/users/UserProfile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ClubProfile = lazy(() => import('./pages/liga-master/ClubProfile'));
const ClubSquad = lazy(() => import('./pages/liga-master/ClubSquad'));
const ClubFinances = lazy(() => import('./pages/liga-master/ClubFinances'));
const ClubPalmares = lazy(() => import('./pages/liga-master/ClubPalmares'));
const HallOfFame = lazy(() => import('./pages/liga-master/HallOfFame'));
const Rankings = lazy(() => import('./pages/liga-master/Rankings'));
const Fixtures = lazy(() => import('./pages/liga-master/Fixtures'));
const MarketTables = lazy(() => import('./pages/liga-master/MarketTables'));
const Zones = lazy(() => import('./pages/liga-master/Zones'));
const Users = lazy(() => import('./pages/users/Users'));
const DtCommunity = lazy(() => import('./pages/liga-master/DtCommunity'));
const Prode = lazy(() => import('./pages/liga-master/Prode'));
const CopaLVZ = lazy(() => import('./pages/liga-master/CopaLVZ'));
const Terms = lazy(() => import('./pages/legal/Terms'));
const Privacy = lazy(() => import('./pages/legal/Privacy'));
const AccountStatus = lazy(() => import('./pages/auth/AccountStatus'));
const Reglamento = lazy(() => import('./pages/liga-master/Reglamento'));

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
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="cuenta-suspendida" element={<AccountStatus />} />
          <Route path="registro" element={<Register />} />
          <Route path="recuperar-password" element={<RecoverPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
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
            <Route path="prode" element={<Prode />} />
            <Route path="copa-lvz" element={<CopaLVZ />} />
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
 
