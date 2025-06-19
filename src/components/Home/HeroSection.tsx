import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section className="relative h-[70vh] flex items-center justify-center bg-gradient-to-br from-primary via-black to-accent">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 text-center space-y-4">
        <h1 className="neon text-5xl md:text-7xl font-bold text-[var(--primary)] drop-shadow-[0_0_8px_var(--primary-glow)]">
          La Virtual Zone
        </h1>
        <Link
          to="/torneos"
          className="inline-block px-6 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-black rounded hover:scale-105 transition-transform"
        >
          Explorar Torneos
        </Link>
      </div>
    </section>
  )
}
