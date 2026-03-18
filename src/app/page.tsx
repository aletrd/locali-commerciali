import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, MapPin, TrendingUp, Shield, Star } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AnnuncioCard from '@/components/annunci/AnnuncioCard'
import { createServerClient } from '@/lib/supabase'
import { CATEGORIE_INFO, PIANI_INFO, CITTA_PRINCIPALI } from '@/types'

export const metadata: Metadata = {
  title: 'LocaliCommerciali.it — Negozi, Uffici e Locali Commerciali in Vendita e Affitto',
  description: 'Trova negozi, uffici, bar, ristoranti, magazzini e capannoni in vendita o affitto in tutta Italia. Pubblica gratis.',
}

export default async function HomePage() {
  const supabase = createServerClient()

  // Annunci in evidenza (SSR)
  const { data: inEvidenza } = await supabase
    .from('annunci')
    .select('*')
    .eq('attivo', true)
    .eq('in_evidenza', true)
    .order('created_at', { ascending: false })
    .limit(6)

  // Ultimi annunci
  const { data: ultimi } = await supabase
    .from('annunci')
    .select('*')
    .eq('attivo', true)
    .order('created_at', { ascending: false })
    .limit(8)

  // Statistiche
  const { count: totaleAnnunci } = await supabase
    .from('annunci').select('*', { count: 'exact', head: true }).eq('attivo', true)

  const { count: totaleUtenti } = await supabase
    .from('profiles').select('*', { count: 'exact', head: true })

  const categorie = Object.entries(CATEGORIE_INFO)

  return (
    <>
      <Navbar />
      <main>

        {/* HERO */}
        <section className="bg-gradient-to-br from-[#083D2E] to-primary-600 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-align-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <Star size={14} className="text-accent-400" fill="currentColor" />
              Il portale #1 per i locali commerciali in Italia
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-semibold leading-tight mb-4">
              Trova il locale<br />commerciale ideale
            </h1>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              Negozi, uffici, bar, magazzini e capannoni in vendita e in affitto in tutta Italia.
              {totaleAnnunci ? ` Oltre ${totaleAnnunci.toLocaleString('it-IT')} annunci verificati.` : ''}
            </p>

            {/* Search bar */}
            <form action="/annunci" method="get"
              className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-hero max-w-3xl mx-auto">
              <div className="flex items-center gap-2 flex-1 px-3">
                <MapPin className="text-mid shrink-0" size={18} />
                <input name="citta" type="text" placeholder="Città o zona..."
                  className="flex-1 outline-none text-dark placeholder-mid text-base py-2 bg-transparent" />
              </div>
              <select name="categoria"
                className="flex-1 px-3 py-2 text-dark text-sm outline-none bg-transparent border-l border-gray-100 cursor-pointer">
                <option value="">Tutte le categorie</option>
                {categorie.map(([v, i]) => (
                  <option key={v} value={v}>{i.emoji} {i.label}</option>
                ))}
              </select>
              <select name="tipo"
                className="px-3 py-2 text-dark text-sm outline-none bg-transparent border-l border-gray-100 cursor-pointer">
                <option value="">Vendita o Affitto</option>
                <option value="vendita">Vendita</option>
                <option value="affitto">Affitto</option>
              </select>
              <button type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors flex items-center gap-2 shrink-0">
                <Search size={18} />
                Cerca
              </button>
            </form>
          </div>
        </section>

        {/* STATISTICHE */}
        <section className="bg-white border-b border-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
            {[
              { valore: totaleAnnunci?.toLocaleString('it-IT') ?? '0', label: 'Annunci attivi' },
              { valore: totaleUtenti?.toLocaleString('it-IT') ?? '0', label: 'Utenti registrati' },
              { valore: CITTA_PRINCIPALI.length.toString() + '+', label: 'Città italiane' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold text-primary-600">{s.valore}</p>
                <p className="text-sm text-mid mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIE */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-3xl font-semibold text-dark mb-2">Cerca per categoria</h2>
            <p className="text-mid mb-8">Trova il tipo di locale commerciale che cerchi</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {categorie.map(([slug, info]) => (
                <Link key={slug} href={`/annunci?categoria=${slug}`}
                  className="card hover:shadow-card-hover hover:border-primary-200 transition-all duration-200 p-4 text-center group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{info.emoji}</div>
                  <div className="text-sm font-semibold text-dark">{info.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ANNUNCI IN EVIDENZA */}
        {inEvidenza && inEvidenza.length > 0 && (
          <section className="py-16 px-4 bg-primary-50/50">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-3xl font-semibold text-dark mb-1">
                    ⭐ In evidenza
                  </h2>
                  <p className="text-mid">Annunci sponsorizzati dai nostri inserzionisti</p>
                </div>
                <Link href="/annunci?evidenza=true" className="text-primary-600 font-semibold text-sm hover:underline">
                  Vedi tutti →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {inEvidenza.map(a => <AnnuncioCard key={a.id} annuncio={a} />)}
              </div>
            </div>
          </section>
        )}

        {/* ULTIMI ANNUNCI */}
        {ultimi && ultimi.length > 0 && (
          <section className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-3xl font-semibold text-dark mb-1">Ultimi annunci</h2>
                  <p className="text-mid">Le ultime opportunità pubblicate</p>
                </div>
                <Link href="/annunci" className="text-primary-600 font-semibold text-sm hover:underline">
                  Vedi tutti →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {ultimi.map(a => <AnnuncioCard key={a.id} annuncio={a} compact />)}
              </div>
            </div>
          </section>
        )}

        {/* CITTÀ PRINCIPALI */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-3xl font-semibold text-dark mb-2">Cerca nella tua città</h2>
            <p className="text-mid mb-8">Locali commerciali nelle principali città italiane</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {CITTA_PRINCIPALI.map(c => (
                <Link key={c.slug} href={`/citta/${c.slug}`}
                  className="card hover:shadow-card-hover hover:border-primary-200 transition-all p-4 text-center">
                  <MapPin className="mx-auto mb-2 text-primary-600" size={20} />
                  <p className="font-semibold text-dark text-sm">{c.nome}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* PIANI */}
        <section className="py-20 px-4 bg-ultra-light">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl font-semibold text-dark mb-3">
                Piani per privati e agenzie
              </h2>
              <p className="text-mid text-lg">Inizia gratis, cresci quando vuoi</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {PIANI_INFO.map(piano => (
                <div key={piano.id}
                  className={`card p-6 flex flex-col relative ${
                    piano.evidenziato
                      ? 'bg-primary-600 border-primary-600 text-white shadow-hero'
                      : 'bg-white'
                  }`}>
                  {piano.evidenziato && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                      Più popolare
                    </div>
                  )}
                  <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                    piano.evidenziato ? 'text-white/70' : 'text-primary-600'}`}>
                    {piano.id === 'agenzia' ? 'Per agenzie' : 'Per privati'}
                  </div>
                  <h3 className={`text-xl font-bold mb-1 ${piano.evidenziato ? 'text-white' : 'text-dark'}`}>
                    {piano.nome}
                  </h3>
                  <p className={`text-sm mb-4 ${piano.evidenziato ? 'text-white/70' : 'text-mid'}`}>
                    {piano.descrizione}
                  </p>
                  <div className={`text-4xl font-extrabold mb-1 ${piano.evidenziato ? 'text-white' : 'text-primary-600'}`}>
                    {piano.prezzo === 0 ? 'Gratis' : `€${piano.prezzo}`}
                  </div>
                  {piano.prezzo > 0 && (
                    <p className={`text-sm mb-5 ${piano.evidenziato ? 'text-white/60' : 'text-mid'}`}>/mese</p>
                  )}
                  <ul className="space-y-2 flex-1 mb-6">
                    {piano.features.map(f => (
                      <li key={f} className={`flex items-start gap-2 text-sm ${
                        piano.evidenziato ? 'text-white/90' : 'text-dark-mid'}`}>
                        <span className="text-accent-500 mt-0.5">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={piano.prezzo === 0 ? '/registrati' : `/prezzi#${piano.id}`}
                    className={`text-center py-3 px-4 rounded-xl font-semibold text-sm transition-colors ${
                      piano.evidenziato
                        ? 'bg-accent-500 hover:bg-accent-600 text-white'
                        : 'border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white'
                    }`}>
                    {piano.prezzo === 0 ? 'Inizia gratis' : `Scegli ${piano.nome}`}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PERCHÉ NOI */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-3xl font-semibold text-dark text-center mb-12">
              Perché scegliere LocaliCommerciali.it
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Shield, titolo: 'Annunci verificati', desc: 'Ogni annuncio viene revisionato dal nostro team prima della pubblicazione.' },
                { icon: TrendingUp, titolo: 'Massima visibilità', desc: 'I tuoi annunci vengono indicizzati su Google in pochi minuti dalla pubblicazione.' },
                { icon: Star, titolo: 'Nessuna pubblicità', desc: 'Nessun banner, nessuna interruzione. Solo annunci veri da inserzionisti reali.' },
              ].map(item => (
                <div key={item.titolo} className="text-center">
                  <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="text-primary-600" size={26} />
                  </div>
                  <h3 className="font-semibold text-dark text-lg mb-2">{item.titolo}</h3>
                  <p className="text-mid text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
