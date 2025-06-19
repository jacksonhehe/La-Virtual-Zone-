import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-[var(--card)] text-center py-8 px-4">
      <p>© La Virtual Zone 2025</p>
      <nav className="mt-2 flex justify-center gap-4">
        <Link to="/ayuda">Ayuda</Link>
        <a href="#">Discord</a>
        <a href="#">Twitter</a>
      </nav>
      <div className="mt-2 flex justify-center gap-2">
        <span>🎮</span>
        <span>💬</span>
        <span>🐦</span>
      </div>
    </footer>
  )
}
