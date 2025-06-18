import { Link } from 'react-router-dom'
import clubs from '../../data/clubs.json'
import styles from './LigaMaster.module.css'

export default function LigaMaster() {
  return (
    <div>
      <h1>Liga Master</h1>
      <div className={styles.cards}>
        {clubs.map((club) => (
          <Link key={club.id} to={`/liga-master/club/${club.id}`} className={styles.card}>
            <img src={club.badge} alt={club.name} width={80} height={80} />
            <h3>{club.name}</h3>
            <p>Presupuesto: {club.budget.toLocaleString('es-PE')}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
