import { Tab } from '@headlessui/react'
import { useParams } from 'react-router-dom'
import torneos from '../../data/torneos.json'

interface Torneo {
  slug: string
  nombre: string
  estado: string
  banner: string
}

export default function Torneo() {
  const { slug } = useParams()
  const torneo = (torneos as Torneo[]).find((t) => t.slug === slug)

  if (!torneo) {
    return <p className="text-center">Torneo no encontrado</p>
  }

  const participantes = [
    'Club Alpha',
    'Club Beta',
    'Club Gamma',
    'Club Delta',
    'Club Epsilon',
    'Club Zeta',
  ]

  const fixture = [
    { fecha: '01/10', local: 'Club Alpha', visita: 'Club Beta', marcador: '2-1' },
    { fecha: '08/10', local: 'Club Gamma', visita: 'Club Delta', marcador: '0-0' },
    { fecha: '15/10', local: 'Club Alpha', visita: 'Club Gamma', marcador: '-' },
  ]

  const posiciones = [
    { equipo: 'Club Alpha', pj: 2, g: 1, e: 1, p: 0, pts: 4 },
    { equipo: 'Club Gamma', pj: 2, g: 1, e: 1, p: 0, pts: 4 },
    { equipo: 'Club Beta', pj: 2, g: 0, e: 1, p: 1, pts: 1 },
    { equipo: 'Club Delta', pj: 2, g: 0, e: 1, p: 1, pts: 1 },
  ]

  const goleadores = [
    { jugador: 'Juan Pérez', goles: 5 },
    { jugador: 'Luis Díaz', goles: 3 },
    { jugador: 'Carlos García', goles: 2 },
    { jugador: 'Marco López', goles: 1 },
    { jugador: 'Miguel Torres', goles: 1 },
  ]

  return (
    <div className="space-y-4">
      <img
        src={torneo.banner}
        alt={torneo.nombre}
        className="w-full h-52 md:h-64 object-cover rounded"
      />
      <h1 className="text-2xl font-bold">{torneo.nombre}</h1>
      <Tab.Group>
        <Tab.List className="flex space-x-4 border-b border-zinc-700">
          {['Participantes', 'Fixture', 'Tabla', 'Goleadores'].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                `py-2 px-3 border-b-2 ${
                  selected
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent'
                }`
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-4">
          <Tab.Panel>
            <ul className="list-disc pl-4 space-y-1">
              {participantes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Tab.Panel>
          <Tab.Panel>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-1">Fecha</th>
                  <th className="py-1">Local</th>
                  <th className="py-1">Visita</th>
                  <th className="py-1">Marcador</th>
                </tr>
              </thead>
              <tbody>
                {fixture.map((f, idx) => (
                  <tr key={idx} className="border-t border-zinc-700">
                    <td className="py-1">{f.fecha}</td>
                    <td className="py-1">{f.local}</td>
                    <td className="py-1">{f.visita}</td>
                    <td className="py-1">{f.marcador}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Tab.Panel>
          <Tab.Panel>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-1">Equipo</th>
                  <th className="py-1">PJ</th>
                  <th className="py-1">G</th>
                  <th className="py-1">E</th>
                  <th className="py-1">P</th>
                  <th className="py-1">PTS</th>
                </tr>
              </thead>
              <tbody>
                {posiciones.map((p, idx) => (
                  <tr key={idx} className="border-t border-zinc-700">
                    <td className="py-1">{p.equipo}</td>
                    <td className="py-1">{p.pj}</td>
                    <td className="py-1">{p.g}</td>
                    <td className="py-1">{p.e}</td>
                    <td className="py-1">{p.p}</td>
                    <td className="py-1">{p.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Tab.Panel>
          <Tab.Panel>
            <ol className="list-decimal pl-4 space-y-1">
              {goleadores.map((g, idx) => (
                <li key={idx}>{`${g.jugador} - ${g.goles}`}</li>
              ))}
            </ol>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}
