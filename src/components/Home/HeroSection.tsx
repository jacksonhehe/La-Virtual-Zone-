import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section className="relative h-[60vh] flex items-center justify-center bg-gradient-to-br from-zinc-800 via-black to-zinc-900">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold text-[var(--primary)] drop-shadow-[0_0_6px_var(--primary-glow)]">
          La Virtual Zone
        </h1>
        <Link
          to="/torneos"
          className="inline-block px-6 py-2 bg-[var(--primary)] text-black rounded hover:scale-105 transition-transform"
        >
          Explorar Torneos
        </Link>
      </div>
    </section>
  )
}
