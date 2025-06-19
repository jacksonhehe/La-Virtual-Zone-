import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="px-4 min-h-[calc(100vh_-_160px)]">
        {children}
      </main>
      <Footer />
    </>
  )
}
