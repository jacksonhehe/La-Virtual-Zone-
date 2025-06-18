import { useState } from 'react'
import items from '../../data/store.json'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'

interface Item {
  id: number
  name: string
  price: number
  image: string
  description: string
}

export default function Tienda() {
  const [selected, setSelected] = useState<Item | null>(null)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Tienda</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {(items as Item[]).map(item => (
          <Card key={item.id} title={item.name} image={item.image} onClick={() => setSelected(item)}>
            <p>S/. {item.price}</p>
          </Card>
        ))}
      </div>
      {selected && (
        <Modal open={true} onClose={() => setSelected(null)} title={selected.name}>
          <img src={selected.image} alt={selected.name} className="w-full h-56 object-cover rounded" />
          <p className="mb-2">Precio: S/. {selected.price}</p>
          <p>{selected.description}</p>
        </Modal>
      )}
    </div>
  )
}
