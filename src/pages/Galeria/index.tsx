import { useState } from 'react'
import gallery from '../../data/gallery.json'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'

interface Item {
  id: number
  title: string
  image: string
  description: string
}

export default function Galeria() {
  const [selected, setSelected] = useState<Item | null>(null)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Galería</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {(gallery as Item[]).map(item => (
          <Card key={item.id} title={item.title} image={item.image} onClick={() => setSelected(item)} />
        ))}
      </div>
      {selected && (
        <Modal open={true} onClose={() => setSelected(null)} title={selected.title}>
          <img src={selected.image} alt={selected.title} className="w-full h-56 object-cover rounded" />
          <p>{selected.description}</p>
        </Modal>
      )}
    </div>
  )
}
