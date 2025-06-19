import Home from './pages/Home'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Usuario from './pages/Usuario'
import LigaMaster from './pages/LigaMaster'
import Club from './pages/LigaMaster/Club'
import Mercado from './pages/LigaMaster/Mercado'
import Fixture from './pages/LigaMaster/Fixture'
import Rankings from './pages/LigaMaster/Rankings'
import HallOfFame from './pages/LigaMaster/HallOfFame'
import Torneos from './pages/Torneos'
import Torneo from './pages/Torneos/Torneo'
import Galeria from './pages/Galeria'
import Blog from './pages/Blog'
import Tienda from './pages/Tienda'
import Admin from './pages/Admin'
import Ayuda from './pages/Ayuda'
import NotFound from './pages/NotFound'
import type { ReactElement } from 'react'

export interface AppRoute {
  path: string
  element: ReactElement
}

const routes: AppRoute[] = [
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/registro', element: <Registro /> },
  { path: '/usuario', element: <Usuario /> },
  { path: '/liga-master', element: <LigaMaster /> },
  { path: '/liga-master/club/:id', element: <Club /> },
  { path: '/liga-master/mercado', element: <Mercado /> },
  { path: '/liga-master/fixture', element: <Fixture /> },
  { path: '/liga-master/rankings', element: <Rankings /> },
  { path: '/liga-master/halloffame', element: <HallOfFame /> },
  { path: '/torneos', element: <Torneos /> },
  { path: '/torneos/:slug', element: <Torneo /> },
  { path: '/galeria', element: <Galeria /> },
  { path: '/blog', element: <Blog /> },
  { path: '/tienda', element: <Tienda /> },
  { path: '/admin', element: <Admin /> },
  { path: '/ayuda', element: <Ayuda /> },
  { path: '*', element: <NotFound /> },
]

export default routes
