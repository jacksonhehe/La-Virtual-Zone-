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
          <a href="https://twitch.tv" aria-label="Twitch">🎮</a>
          <a href="https://discord.com" aria-label="Discord">💬</a>
          <a href="https://twitter.com" aria-label="Twitter">🐦</a>
        </div>
      </footer>
  )
}
