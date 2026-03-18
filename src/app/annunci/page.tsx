import type { Metadata } from 'next'
import { Suspense } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AnnuncioCard from '@/components/annunci/AnnuncioCard'
import FiltriSidebar from '@/components/annunci/FiltriSidebar'
import { createServerClient } from '@/lib/supabase'
import { CATEGORIE_INFO } from '@/types'
import type { CategoriaLocale, TipoAnnuncio } from '@/types'

interface Props {
  searchParams: {
    citta?: string
    categoria?: CategoriaLocale
    tipo?: TipoAnnuncio
    prezzoMin?: string
    prezzoMax?: string
    superficieMin?: string
    query?: string
    evidenza?: string
    page?: string
  }
}

export async function generateMetadata({ searchParams: p }: Props): Promise<Metadata> {
  const parts = []
  if (p.categoria) parts.push(CATEGORIE_INFO[p.categoria]?.label ?? p.categoria)
  if (p.citta) parts.push(`a ${p.citta}`)
  if (p.tipo) parts.push(`in ${p.tipo}`)
  const suffix = parts.length > 0 ? ` ${parts.join(' ')}` : ''
  return {
    title: `Locali Commerciali${suffix}`,
    description: `Trova locali commerciali${suffix} in tutta Italia. Annunci verificati con foto, prezzi e mappa.`,
  }
}

const PER_PAGINA = 24

export default async function AnnunciPage({ searchParams: p }: Props) {
  const supabase = createServerClient()
  const pagina = parseInt(p.page ?? '1')
  const offset = (pagina - 1) * PER_PAGINA

  let query = supabase
    .from('annunci')
    .select('*', { count: 'exact' })
    .eq('attivo', true)
    .eq('moderato', true)

  if (p.citta)        query = query.ilike('citta', `%${p.citta}%`)
  if (p.categoria)    query = query.eq('categoria', p.categoria)
  if (p.tipo)         query = query.eq('tipo', p.tipo)
  if (p.prezzoMin)    query = query.gte('prezzo', parseInt(p.prezzoMin))
  if (p.prezzoMax)    query = query.lte('prezzo', parseInt(p.prezzoMax))
  if (p.superficieMin) query = query.gte('superficie_mq', parseInt(p.superficieMin))
  if (p.evidenza)     query = query.eq('in_evidenza', true)
  if (p.query)        query = query.or(`titolo.ilike.%${p.query}%,descrizione.ilike.%${p.query}%,citta.ilike.%${p.query}%`)

  const { data: annunci, count } = await query
    .order('in_evidenza', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + PER_PAGINA - 1)

  const totalePagine = Math.ceil((count ?? 0) / PER_PAGINA)

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar filtri */}
          <aside className="lg:w-64 shrink-0">
            <FiltriSidebar filtriCorrente={p} />
          </aside>

          {/* Lista annunci */}
          <div className="flex-1">
            {/* Header risultati */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-dark">
                  {p.categoria ? CATEGORIE_INFO[p.categoria]?.label : 'Locali commerciali'}
                  {p.citta ? ` a ${p.citta}` : ''}
                  {p.tipo ? ` in ${p.tipo}` : ''}
                </h1>
                <p className="text-sm text-mid mt-0.5">
                  {count ?? 0} annunci trovati
                  {pagina > 1 ? ` — pagina ${pagina} di ${totalePagine}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a href="/mappa" className="btn-outline text-sm py-2 px-4">
                  🗺️ Vedi su mappa
                </a>
              </div>
            </div>

            {/* Griglia */}
            {!annunci || annunci.length === 0 ? (
              <div className="card p-16 text-center">
                <p className="text-4xl mb-4">🔍</p>
                <h3 className="text-xl font-semibold text-dark mb-2">Nessun annuncio trovato</h3>
                <p className="text-mid mb-6">Prova a modificare i filtri o a cercare in un'altra città</p>
                <a href="/annunci" className="btn-primary">Rimuovi tutti i filtri</a>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {annunci.map(a => <AnnuncioCard key={a.id} annuncio={a as any} />)}
                </div>

                {/* Paginazione */}
                {totalePagine > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    {Array.from({ length: Math.min(totalePagine, 10) }, (_, i) => i + 1).map(n => {
                      const params = new URLSearchParams(p as any)
                      params.set('page', String(n))
                      return (
                        <a key={n} href={`/annunci?${params.toString()}`}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                            n === pagina
                              ? 'bg-primary-600 text-white'
                              : 'bg-white border border-gray-200 text-dark hover:border-primary-300'
                          }`}>
                          {n}
                        </a>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
