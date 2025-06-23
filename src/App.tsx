import  { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import LoadingScreen from './components/common/LoadingScreen';
import Spinner from './components/common/Spinner';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const UserPanel = lazy(() => import('./pages/UserPanel'));
const LigaMaster = lazy(() => import('./pages/LigaMaster'));
const Market = lazy(() => import('./pages/Market'));
const Tournaments = lazy(() => import('./pages/Tournaments'));
const TournamentDetail = lazy(() => import('./pages/TournamentDetail'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Store = lazy(() => import('./pages/Store'));
const Help = lazy(() => import('./pages/Help'));
const Admin = lazy(() => import('./pages/Admin'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ClubProfile = lazy(() => import('./pages/ClubProfile'));
const ClubSquad = lazy(() => import('./pages/ClubSquad'));
const ClubFinances = lazy(() => import('./pages/ClubFinances'));
const HallOfFame = lazy(() => import('./pages/HallOfFame'));
const Rankings = lazy(() => import('./pages/Rankings'));
const Fixtures = lazy(() => import('./pages/Fixtures'));
const DtDashboard = lazy(() => import('./pages/DtDashboard'));
const Feed = lazy(() => import('./pages/Feed'));
const Tacticas = lazy(() => import('./pages/Tacticas'));
const Analisis = lazy(() => import('./pages/Analisis'));
const Plantilla = lazy(() => import('./pages/Plantilla'));
const Finanzas = lazy(() => import('./pages/Finanzas'));
const Calendario = lazy(() => import('./pages/Calendario'));

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Register />} />
          <Route path="usuario" element={<UserPanel />} />
          <Route path="dt-dashboard" element={<DtDashboard />} />
          
          {/* Liga Master routes */}
        <Route path="liga-master">
          <Route index element={<LigaMaster />} />
          <Route
            path="mercado"
            element={(
              <Suspense fallback={<Spinner />}>
                <Market />
              </Suspense>
            )}
          />
          <Route path="club/:clubName" element={<ClubProfile />} />
         <Route path="club/:clubName/plantilla" element={<ClubSquad />} />
         <Route path="clubes/:clubId/plantilla" element={<ClubSquad />} />
         <Route path="club/:clubName/finanzas" element={<ClubFinances />} />
          <Route path="hall-of-fame" element={<HallOfFame />} />
          <Route
            path="rankings"
            element={(
              <Suspense fallback={<Spinner />}>
                <Rankings />
              </Suspense>
            )}
          />
          <Route
            path="fixture"
            element={(
              <Suspense fallback={<Spinner />}>
                <Fixtures />
              </Suspense>
            )}
          />
          <Route path="plantilla" element={<Plantilla />} />
          <Route path="finanzas" element={<Finanzas />} />
          <Route path="calendario" element={<Calendario />} />
          <Route path="feed" element={<Feed />} />
          <Route path="tacticas" element={<Tacticas />} />
          <Route path="analisis" element={<Analisis />} />
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
          <Route path="tienda" element={<Store />} />
          <Route path="ayuda" element={<Help />} />
          <Route path="admin" element={<Admin />} />
          <Route path="usuarios/:username" element={<UserProfile />} />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
 