import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>© La Virtual Zone 2025</p>
      <nav className={styles.links}>
        <Link to="/ayuda">Ayuda</Link>
        <a href="#">Discord</a>
        <a href="#">Twitter</a>
      </nav>
      <div className={styles.socials}>
        <span>🎮</span>
        <span>💬</span>
        <span>🐦</span>
      </div>
    </footer>
  )
}
