import { BrowserRouter, Routes, Route } from 'react-router-dom'
import routes from './routes'
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {routes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
