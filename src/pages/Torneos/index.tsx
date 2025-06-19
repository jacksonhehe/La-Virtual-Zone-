import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import torneos from '../../data/torneos.json'
import Card from '../../components/ui/Card'

interface Torneo {
  slug: string
  nombre: string
  estado: string
  banner: string
}

export default function Torneos() {
  const [filtro, setFiltro] = useState('Todos')
  const navigate = useNavigate()

  const lista = (torneos as Torneo[]).filter(
    (t) => filtro === 'Todos' || t.estado === filtro,
  )

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Torneos</h1>
      <label htmlFor="filtro-torneos" className="block space-y-1">
        <span className="text-sm">Filtrar torneos</span>
        <select
          id="filtro-torneos"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="bg-zinc-900 border border-[var(--primary)] rounded px-2 py-1"
        >
          <option value="Todos">Todos</option>
          <option value="Inscripciones">Inscripciones</option>
          <option value="En curso">En curso</option>
          <option value="Finalizado">Finalizado</option>
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {lista.map((t) => (
          <Card
            key={t.slug}
            title={t.nombre}
            image={t.banner}
            onClick={() => navigate('/torneos/' + t.slug)}
          >
            <p className="text-sm">{t.estado}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
