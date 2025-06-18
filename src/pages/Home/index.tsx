import HeroSection from '../../components/Home/HeroSection'
import Card from '../../components/ui/Card'
import torneos from '../../data/torneos.json'
import noticias from '../../data/blog.json'

type Torneo = {
  slug: string
  nombre: string
  estado: string
  banner: string
}

type Noticia = {
  slug: string
  titulo: string
  resumen: string
  thumb: string
}

export default function Home() {
  const proximos = (torneos as Torneo[]).slice(0, 3)
  const ultimas = (noticias as Noticia[]).slice(0, 3)

  return (
    <div className="space-y-8">
      <HeroSection />
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-[var(--primary)]">Próximos eventos</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {proximos.map((t) => (
            <Card key={t.slug} title={t.nombre} image={t.banner}>
              <p className="text-sm">{t.estado}</p>
            </Card>
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-[var(--primary)]">Últimas noticias</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {ultimas.map((n) => (
            <Card key={n.slug} title={n.titulo} image={n.thumb}>
              <p className="text-sm">{n.resumen}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
