import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingInline: '1rem', minHeight: 'calc(100vh - 160px)' }}>
        {children}
      </main>
      <Footer />
    </>
  )
}
