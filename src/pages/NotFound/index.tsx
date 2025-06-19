import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-2xl font-bold">Página no encontrada</h1>
      <p>La URL que visitaste no existe.</p>
      <Link to="/" className="underline text-[var(--primary)]">
        Volver al inicio
      </Link>
    </div>
  )
}
