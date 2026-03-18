import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AnnuncioCard from '@/components/annunci/AnnuncioCard'
import { createAdminClient } from '@/lib/supabase'
import { CATEGORIE_INFO, PIANI_INFO, CITTA_PRINCIPALI } from '@/types'

export const metadata: Metadata = {
  title: 'LocaliCommerciali.it — Negozi, Uffici e Locali Commerciali',
  description: 'Trova negozi, uffici, bar, magazzini e capannoni in vendita o affitto in tutta Italia.',
}

export default async function HomePage() {
  const supabase = createAdminClient()
  const { data: ultimi } = await supabase.from('annunci').select('*').eq('attivo', true).order('created_at', { ascending: false }).limit(8)
  const { count: totaleAnnunci } = await supabase.from('annunci').select('*', { count: 'exact', head: true }).eq('attivo', true)
  const categorie = Object.entries(CATEGORIE_INFO)

  return (
    <>
      <Navbar />
      <main>
        <section className="bg-gradient-to-br from-[#083D2E] to-[#0A5C44] text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-4">
              Trova il locale commerciale ideale
            </h1>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              Negozi, uffici, bar, magazzini e capannoni in vendita e in affitto in tutta Italia.
              {totaleAnnunci ? ` Oltre ${totaleAnnunci.toLocaleString('it-IT')} annunci.` : ''}
            </p>
            <form action="/annunci" method="get" className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto">
              <input name="citta" type="text" placeholder="Città o zona..." className="flex-1 outline-none text-gray-800 px-3 py-2 text-base bg-transparent" />
              <select name="categoria" className="flex-1 px-3 py-2 text-gray-800 text-sm outline-none bg-transparent">
                <option value="">Tutte le categorie</option>
                {categorie.map(([v, i]) => <option key={v} value={v}>{i.emoji} {i.label}</option>)}
              </select>
              <button type="submit" className="bg-green-800 hover:bg-green-900 text-white font-semibold px-8 py-3 rounded-xl transition-colors shrink-0">Cerca</button>
            </form>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-semibold text-gray-900 mb-8">Cerca per categoria</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {categorie.map(([slug, info]) => (
                <Link key={slug} href={`/annunci?categoria=${slug}`} className="bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all p-4 text-center">
                  <div className="text-3xl mb-2">{info.emoji}</div>
                  <div className="text-sm font-semibold text-gray-900">{info.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {ultimi && ultimi.length > 0 && (
          <section className="py-16 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold text-gray-900">Ultimi annunci</h2>
                <Link href="/annunci" className="text-green-700 font-semibold text-sm hover:underline">Vedi tutti →</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {ultimi.map((a: any) => <AnnuncioCard key={a.id} annuncio={a} compact />)}
              </div>
            </div>
          </section>
        )}

        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-semibold text-gray-900 mb-8">Cerca nella tua città</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {CITTA_PRINCIPALI.map(c => (
                <Link key={c.slug} href={`/citta/${c.slug}`} className="bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all p-4 text-center">
                  <p className="font-semibold text-gray-900 text-sm">{c.nome}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
