import { Link } from 'react-router-dom'
import { FaTwitch, FaDiscord, FaTwitter } from 'react-icons/fa'
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
          <a href="https://twitch.tv" aria-label="Twitch">
            <FaTwitch />
          </a>
          <a href="https://discord.com" aria-label="Discord">
            <FaDiscord />
          </a>
          <a href="https://twitter.com" aria-label="Twitter">
            <FaTwitter />
          </a>
        </div>
      </footer>
  )
}
