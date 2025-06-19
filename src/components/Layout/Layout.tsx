import Navbar from './Navbar'
import Footer from './Footer'
import styles from './Layout.module.css'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <a href="#contenido" className="skip-link">Saltar al contenido</a>
      <Navbar />
      <main id="contenido" className={styles.main}>{children}</main>
      <Footer />
    </div>
  )
}
