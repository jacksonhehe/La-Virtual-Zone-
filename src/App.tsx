import { BrowserRouter, Routes, Route } from 'react-router-dom'
import routes from './routes'
import Layout from './components/Layout/Layout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((r) => (
          <Route key={r.path} path={r.path} element={<Layout>{r.element}</Layout>} />
        ))}
      </Routes>
    </BrowserRouter>
  )
}
