
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

function App() {
  return (
    <div className="min-h-screen bg-[#18181f] text-white">
      <Toaster position="top-right" />
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="liga-master" element={<LigaMaster />} />
            <Route path="liga-master/plantilla" element={<Plantilla />} />
            <Route path="liga-master/tacticas" element={<Tacticas />} />
            <Route path="liga-master/finanzas" element={<Finanzas />} />
            <Route path="liga-master/calendario" element={<Calendario />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
