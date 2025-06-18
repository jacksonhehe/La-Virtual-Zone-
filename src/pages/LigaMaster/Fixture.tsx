import fixture from '../../data/fixture.json'
import clubs from '../../data/clubs.json'
import styles from './LigaMaster.module.css'

const clubName = (id: number) => clubs.find((c) => c.id === id)?.name || ''

export default function Fixture() {
  return (
    <div>
      <h1>Fixture</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Jornada</th>
            <th>Local</th>
            <th>Visitante</th>
            <th>Marcador</th>
          </tr>
        </thead>
        <tbody>
          {fixture.map((m, i) => (
            <tr key={i}>
              <td>{m.round}</td>
              <td>{clubName(m.home)}</td>
              <td>{clubName(m.away)}</td>
              <td>{m.score === '—' ? 'Pendiente' : m.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
