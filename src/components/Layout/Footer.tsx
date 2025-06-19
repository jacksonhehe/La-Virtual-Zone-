import { Link } from 'react-router-dom'
import { FaTwitch, FaDiscord, FaTwitter } from 'react-icons/fa'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>© La Virtual Zone 2025</p>
      <nav className={styles.links}>
        <Link to="/ayuda">Ayuda</Link>
        <a
          href="https://discord.gg/lavirtualzone"
          target="_blank"
          rel="noopener noreferrer"
        >
          Discord
        </a>
        <a
          href="https://twitter.com/LaVirtualZone"
          target="_blank"
          rel="noopener noreferrer"
        >
          Twitter
        </a>
      </nav>
        <div className={styles.socials}>
          <a
            href="https://twitch.tv"
            aria-label="Twitch"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitch />
          </a>
          <a
            href="https://discord.gg/lavirtualzone"
            aria-label="Discord"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaDiscord />
          </a>
          <a
            href="https://twitter.com/LaVirtualZone"
            aria-label="Twitter"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitter />
          </a>
        </div>
      </footer>
  )
}
