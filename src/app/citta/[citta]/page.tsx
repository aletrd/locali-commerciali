import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AnnuncioCard from '@/components/annunci/AnnuncioCard'
import { createServerClient } from '@/lib/supabase'
import { CATEGORIE_INFO, CITTA_PRINCIPALI } from '@/types'
import { formatPrezzo } from '@/lib/utils'
export const dynamic = 'force-dynamic'
interface Props { params: { citta: string } }

export async function generateStaticParams() {
  return CITTA_PRINCIPALI.map(c => ({ citta: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const nome = params.citta.charAt(0).toUpperCase() + params.citta.slice(1)
  return {
    title: `Locali Commerciali a ${nome} — Negozi, Uffici, Capannoni`,
    description: `Trova locali commerciali a ${nome}: negozi, uffici, bar, ristoranti, magazzini e capannoni in vendita e affitto. Annunci verificati con foto e mappa.`,
    alternates: { canonical: `https://www.localicommerciali.it/citta/${params.citta}` },
  }
}

export default async function CittaPage({ params }: Props) {
  const supabase = createServerClient()
  const nome = params.citta.charAt(0).toUpperCase() + params.citta.slice(1)

  const { data: annunci } = await supabase
    .from('annunci').select('*')
    .ilike('citta', `%${nome}%`)
    .eq('attivo', true)
    .order('in_evidenza', { ascending: false })
    .order('created_at', { ascending: false })

  const inVendita = annunci?.filter(a => a.tipo === 'vendita') ?? []
  const inAffitto = annunci?.filter(a => a.tipo === 'affitto') ?? []

  const prezzoMedioV = inVendita.length
    ? inVendita.reduce((s, a) => s + a.prezzo, 0) / inVendita.length : null
  const prezzoMedioA = inAffitto.length
    ? inAffitto.reduce((s, a) => s + a.prezzo, 0) / inAffitto.length : null

  const perCategoria = Object.entries(CATEGORIE_INFO).map(([slug, info]) => ({
    slug, ...info,
    count: annunci?.filter(a => a.categoria === slug).length ?? 0,
  })).filter(c => c.count > 0)

  // Schema.org
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Locali Commerciali a ${nome}`,
    description: `Lista di locali commerciali disponibili a ${nome}`,
    url: `https://www.localicommerciali.it/citta/${params.citta}`,
    numberOfItems: annunci?.length ?? 0,
  }

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#083D2E] to-primary-600 text-white py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs mb-4">
            🏙️ Locali Commerciali
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">{nome}</h1>
          <p className="text-white/70 text-lg">
            {annunci?.length ?? 0} annunci disponibili
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-10">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Totale annunci', val: annunci?.length ?? 0 },
            { label: 'In vendita', val: inVendita.length },
            { label: 'In affitto', val: inAffitto.length },
            { label: 'Prezzo medio vendita', val: prezzoMedioV ? `€${Math.round(prezzoMedioV / 1000)}k` : '—' },
          ].map(s => (
            <div key={s.label} className="card p-5 text-center">
              <p className="text-2xl font-extrabold text-primary-600">{s.val}</p>
              <p className="text-xs text-mid mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Categorie */}
        {perCategoria.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display text-2xl font-semibold text-dark mb-5">
              Cerca per categoria a {nome}
            </h2>
            <div className="flex flex-wrap gap-3">
              {perCategoria.map(c => (
                <Link key={c.slug} href={`/annunci?citta=${nome}&categoria=${c.slug}`}
                  className="card px-4 py-3 hover:shadow-card-hover transition-all flex items-center gap-2">
                  <span className="text-xl">{c.emoji}</span>
                  <span className="font-semibold text-dark text-sm">{c.label}</span>
                  <span className="badge bg-primary-50 text-primary-700">{c.count}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Lista annunci */}
        <h2 className="font-display text-2xl font-semibold text-dark mb-6">
          Tutti gli annunci a {nome}
        </h2>

        {!annunci || annunci.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-4xl mb-4">🏙️</p>
            <h3 className="text-xl font-semibold mb-2">Nessun annuncio a {nome}</h3>
            <p className="text-mid mb-6">Sii il primo a pubblicare nella tua città!</p>
            <Link href="/crea-annuncio" className="btn-primary">Pubblica annuncio</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {annunci.map(a => <AnnuncioCard key={a.id} annuncio={a as any} compact />)}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
