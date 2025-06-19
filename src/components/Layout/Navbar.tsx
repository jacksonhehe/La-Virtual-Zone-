import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-gradient-to-r from-[#111] via-[#1a1a1a] to-[#111] border-b-2 border-[var(--primary)]">
      <Link to="/" className="text-xl font-bold text-[var(--primary)]">La Virtual Zone</Link>
      <button
        className="flex flex-col gap-1.5 md:hidden"
        onClick={() => setOpen(!open)}
      >
        <span className="w-6 h-[3px] bg-[var(--text)] transition-all" />
        <span className="w-6 h-[3px] bg-[var(--text)] transition-all" />
        <span className="w-6 h-[3px] bg-[var(--text)] transition-all" />
      </button>
      <ul
        className={`list-none flex gap-4 transition-all fixed top-0 right-0 h-screen w-[200px] pt-16 flex-col bg-[var(--card)] transform ${open ? 'translate-x-0' : 'translate-x-full'} md:static md:h-auto md:w-auto md:p-0 md:flex-row md:bg-transparent md:translate-x-0`}
      >
        <li><Link to="/" onClick={() => setOpen(false)}>Inicio</Link></li>
        <li><Link to="/liga-master" onClick={() => setOpen(false)}>Liga Master</Link></li>
        <li><Link to="/torneos" onClick={() => setOpen(false)}>Torneos</Link></li>
        <li><Link to="/galeria" onClick={() => setOpen(false)}>Galería</Link></li>
        <li><Link to="/blog" onClick={() => setOpen(false)}>Blog</Link></li>
        <li><Link to="/login" onClick={() => setOpen(false)}>Iniciar Sesión</Link></li>
      </ul>
    </header>
  )
}
