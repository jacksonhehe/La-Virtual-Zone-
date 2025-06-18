import { useState } from 'react'
import tournaments from '../../data/tournaments.json'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'

interface Tournament {
  id: number
  name: string
  game: string
  date: string
  image: string
  details: string
}

export default function Torneos() {
  const [selected, setSelected] = useState<Tournament | null>(null)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Torneos</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {(tournaments as Tournament[]).map(t => (
          <Card key={t.id} title={t.name} image={t.image} onClick={() => setSelected(t)}>
            <p className="text-sm">{t.game}</p>
            <p className="text-sm">{new Date(t.date).toLocaleDateString()}</p>
          </Card>
        ))}
      </div>
      {selected && (
        <Modal open={true} onClose={() => setSelected(null)} title={selected.name}>
          <img src={selected.image} alt={selected.name} className="w-full h-56 object-cover rounded" />
          <p className="text-sm">Juego: {selected.game}</p>
          <p className="text-sm">Fecha: {new Date(selected.date).toLocaleDateString()}</p>
          <p>{selected.details}</p>
        </Modal>
      )}
    </div>
  )
}
