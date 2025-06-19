import { useState } from 'react'
import players from '../../data/players.json'
import clubs from '../../data/clubs.json'
import styles from './LigaMaster.module.css'

export default function Mercado() {
  const [pos, setPos] = useState('')
  const [search, setSearch] = useState('')

  const filtered = players.filter(
    (p) =>
      (!pos || p.pos === pos) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleOffer(id: number) {
    alert('Oferta simulada')
    const prev = JSON.parse(localStorage.getItem('ofertasPendientes') || '[]')
    localStorage.setItem('ofertasPendientes', JSON.stringify([...prev, id]))
  }

  const positions = Array.from(new Set(players.map((p) => p.pos)))

  const clubName = (id: number) => clubs.find((c) => c.id === id)?.name || ''

  return (
    <div>
      <h1>Mercado de Fichajes</h1>
      <div className="flex flex-wrap gap-4 mb-4">
        <label htmlFor="mercado-pos" className="block space-y-1">
          <span className="text-sm">Posición</span>
          <select
            id="mercado-pos"
            value={pos}
            onChange={(e) => setPos(e.target.value)}
            className="bg-zinc-900 border border-[var(--primary)] rounded px-2 py-1"
          >
            <option value="">Todas las posiciones</option>
            {positions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
        <label htmlFor="mercado-search" className="block space-y-1">
          <span className="text-sm">Buscar jugador</span>
          <input
            id="mercado-search"
            type="text"
            placeholder="Buscar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-900 border border-[var(--primary)] rounded px-2 py-1"
          />
        </label>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Pos</th>
            <th>Media</th>
            <th>Valor</th>
            <th>Club</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.pos}</td>
              <td>{p.rating}</td>
              <td>{p.value.toLocaleString('es-PE')}</td>
              <td>{clubName(p.clubId)}</td>
              <td>
                <button onClick={() => handleOffer(p.id)}>Ofertar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
