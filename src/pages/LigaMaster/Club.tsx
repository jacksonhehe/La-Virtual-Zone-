import { useParams } from 'react-router-dom'
import { useState } from 'react'
import clubs from '../../data/clubs.json'

export default function Club() {
  const { id } = useParams()
  const club = clubs.find((c) => c.id === Number(id))
  const [showMsg, setShowMsg] = useState(false)

  if (!club) return <p>Club no encontrado</p>

  return (
    <div>
      <h1>{club.name}</h1>
      <img src={club.badge} alt={club.name} width={100} height={100} />
      <p>DT: {club.dt}</p>
      <p>Presupuesto: {club.budget.toLocaleString('es-PE')}</p>
      <button onClick={() => setShowMsg(true)}>Plantilla</button>
      <button onClick={() => setShowMsg(true)}>Finanzas</button>
      {showMsg && <p>En construcción…</p>}
    </div>
  )
}
