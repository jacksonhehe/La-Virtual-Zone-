
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import Spinner from "./components/Spinner";

const LigaMaster = lazy(() => import("./pages/LigaMaster"));
const PlantillaPage = lazy(() => import("./pages/PlantillaPage"));
const TacticasPage = lazy(() => import("./pages/TacticasPage"));
const FinanzasPage = lazy(() => import("./pages/FinanzasPage"));
const CalendarioPage = lazy(() => import("./pages/CalendarioPage"));

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#18181f] text-white">
        <Toaster position="top-right" />
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/liga-master" element={<LigaMaster />} />
            <Route path="/liga-master/plantilla" element={<PlantillaPage />} />
            <Route path="/liga-master/tacticas" element={<TacticasPage />} />
            <Route path="/liga-master/finanzas" element={<FinanzasPage />} />
            <Route path="/liga-master/calendario" element={<CalendarioPage />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

export default App;
