import  { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import LoadingScreen from './components/common/LoadingScreen';

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
            <Route path="mercado" element={<Market />} />
            <Route path="club/:clubName" element={<ClubProfile />} />
          <Route path="club/:clubName/plantilla" element={<ClubSquad />} />
          <Route path="clubes/:clubId/plantilla" element={<ClubSquad />} />
          <Route path="club/:clubName/finanzas" element={<ClubFinances />} />
            <Route path="hall-of-fame" element={<HallOfFame />} />
            <Route path="rankings" element={<Rankings />} />
            <Route path="fixture" element={<Fixtures />} />
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
 