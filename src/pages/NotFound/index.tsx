import { Link } from 'react-router-dom'
import { FaExclamationTriangle } from 'react-icons/fa'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
      <FaExclamationTriangle className="text-6xl text-[var(--accent)]" />
      <h1 className="neon text-6xl md:text-8xl font-bold text-[var(--primary)] drop-shadow-[0_0_8px_var(--primary-glow)]">404</h1>
      <p className="text-lg">Lo sentimos, la página que buscas no existe.</p>
      <Link
        to="/"
        className="inline-block px-6 py-2 bg-[var(--primary)] text-black font-bold rounded hover:scale-105 transition-transform"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
