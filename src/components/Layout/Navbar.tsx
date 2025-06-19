import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaMoon, FaSun } from 'react-icons/fa'
import { useTheme } from '../../hooks/useTheme'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navId = 'main-nav'
  const { theme, toggleTheme } = useTheme()

  return (
    <header className={styles.navbar}>
      <Link to="/" className={styles.logo}>La Virtual Zone</Link>
      <button
        className={styles.hamburger}
        aria-expanded={open}
        aria-controls={navId}
        aria-label="Menú"
        onClick={() => setOpen(!open)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <button
        className={styles.themeToggle}
        onClick={toggleTheme}
        aria-label="Alternar tema"
      >
        {theme === 'light' ? <FaMoon /> : <FaSun />}
      </button>
      <nav>
        <ul id={navId} className={`${styles.links} ${open ? styles.open : ''}`}>
          <li><Link to="/" onClick={() => setOpen(false)}>Inicio</Link></li>
          <li><Link to="/liga-master" onClick={() => setOpen(false)}>Liga Master</Link></li>
          <li><Link to="/torneos" onClick={() => setOpen(false)}>Torneos</Link></li>
          <li><Link to="/galeria" onClick={() => setOpen(false)}>Galería</Link></li>
          <li><Link to="/blog" onClick={() => setOpen(false)}>Blog</Link></li>
          <li><Link to="/login" onClick={() => setOpen(false)}>Iniciar Sesión</Link></li>
        </ul>
      </nav>
    </header>
  )
}
