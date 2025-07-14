
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import Spinner from "./components/Spinner";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout/Layout";

const LigaMaster = lazy(() => import("./pages/LigaMaster"));
const Plantilla = lazy(() => import("./pages/Plantilla"));
const Tacticas = lazy(() => import("./pages/Tacticas"));
const Finanzas = lazy(() => import("./pages/Finanzas"));
const Calendario = lazy(() => import("./pages/Calendario"));

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const UserPanel = lazy(() => import("./pages/UserPanel"));
const Users = lazy(() => import("./pages/Users"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const RecuperarContrasena = lazy(() => import("./pages/RecuperarContrasena"));
const DefinirContrasena = lazy(() => import("./pages/DefinirContrasena"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));

const Tournaments = lazy(() => import("./pages/Tournaments"));
const TournamentDetail = lazy(() => import("./pages/TournamentDetail"));

const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

const Gallery = lazy(() => import("./pages/Gallery"));
const Store = lazy(() => import("./pages/Store"));
const Help = lazy(() => import("./pages/Help"));
const DtDashboard = lazy(() => import("./pages/DtDashboard"));

const Fixtures = lazy(() => import("./pages/Fixtures"));
const Rankings = lazy(() => import("./pages/Rankings"));
const HallOfFame = lazy(() => import("./pages/HallOfFame"));
const Feed = lazy(() => import("./pages/Feed"));
const Analisis = lazy(() => import("./pages/Analisis"));
const ClubProfile = lazy(() => import("./pages/ClubProfile"));
const ClubFinances = lazy(() => import("./pages/ClubFinances"));
const ClubSquad = lazy(() => import("./pages/ClubSquad"));
const Admin = lazy(() => import("./pages/Admin"));
import { AdminRoute } from "./router/AdminRoute";

function App() {
  return (
    <div className="min-h-screen bg-[#18181f] text-white">
      <Toaster position="top-right" />
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />

            <Route path="login" element={<Login />} />
            <Route path="registro" element={<Register />} />
            <Route path="recuperar-password" element={<RecuperarContrasena />} />
            <Route path="reset/:token" element={<DefinirContrasena />} />
            <Route path="terminos" element={<Terms />} />
            <Route path="privacidad" element={<Privacy />} />
            <Route path="usuarios" element={<Users />} />
            <Route path="usuarios/:username" element={<PublicProfile />} />
            <Route path="usuario" element={<UserPanel />} />
            <Route path="dt-dashboard" element={<DtDashboard />} />
            <Route element={<AdminRoute />}>
              <Route path="admin/*" element={<Admin />} />
            </Route>

            <Route path="torneos">
              <Route index element={<Tournaments />} />
              <Route path=":tournamentName" element={<TournamentDetail />} />
            </Route>

            <Route path="blog">
              <Route index element={<Blog />} />
              <Route path=":slug" element={<BlogPost />} />
            </Route>

            <Route path="galeria" element={<Gallery />} />
            <Route path="tienda" element={<Store />} />
            <Route path="ayuda" element={<Help />} />

            <Route path="liga-master" element={<LigaMaster />} />
            <Route path="liga-master/plantilla" element={<Plantilla />} />
            <Route path="liga-master/tacticas" element={<Tacticas />} />
            <Route path="liga-master/finanzas" element={<Finanzas />} />
            <Route path="liga-master/calendario" element={<Calendario />} />
            <Route path="liga-master/fixture" element={<Fixtures />} />
            <Route path="liga-master/rankings" element={<Rankings />} />
            <Route path="liga-master/hall-of-fame" element={<HallOfFame />} />
            <Route path="liga-master/feed" element={<Feed />} />
            <Route path="liga-master/analisis" element={<Analisis />} />
            <Route path="liga-master/club/:clubName" element={<ClubProfile />} />
            <Route path="liga-master/club/:clubName/finanzas" element={<ClubFinances />} />
            <Route path="liga-master/club/:clubName/plantilla" element={<ClubSquad />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
