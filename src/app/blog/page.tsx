import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createServerClient } from '@/lib/supabase'
import { formatData, tempoLettura } from '@/lib/utils'
import type { ArticoloBlog } from '@/types'

export const metadata: Metadata = {
  title: 'Blog — Guide e Consigli sui Locali Commerciali',
  description: 'Guide pratiche su come comprare, vendere e affittare locali commerciali. Consigli di esperti, normative, mercato immobiliare.',
}

export default async function BlogPage({
  searchParams,
}: { searchParams: { tag?: string } }) {
  const supabase = createServerClient()

  let query = supabase
    .from('blog_articoli')
    .select('*')
    .eq('pubblicato', true)
    .order('pubblicato_il', { ascending: false })

  if (searchParams.tag) {
    query = query.contains('tags', [searchParams.tag])
  }

  const { data: articoli } = await query.limit(20)

  // Raccoglie tutti i tag unici
  const { data: tuttiGliArticoli } = await supabase
    .from('blog_articoli').select('tags').eq('pubblicato', true)
  const tags = [...new Set(tuttiGliArticoli?.flatMap(a => a.tags ?? []) ?? [])]

  const hero = articoli?.[0]
  const resto = articoli?.slice(1) ?? []

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-semibold px-3 py-1.5 rounded-full mb-4">
            ✍️ Guide e consigli
          </div>
          <h1 className="font-display text-4xl font-semibold text-dark mb-3">
            Blog LocaliCommerciali.it
          </h1>
          <p className="text-mid text-lg max-w-2xl">
            Tutto quello che devi sapere per comprare, vendere o affittare un locale commerciale in Italia.
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-10">
          <Link href="/blog"
            className={`badge ${!searchParams.tag ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-dark hover:border-primary-300'} transition-colors`}>
            Tutti
          </Link>
          {tags.map(tag => (
            <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}
              className={`badge ${searchParams.tag === tag ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-dark hover:border-primary-300'} transition-colors`}>
              {tag}
            </Link>
          ))}
        </div>

        {!articoli || articoli.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-4xl mb-4">✍️</p>
            <h3 className="text-xl font-semibold mb-2">Nessun articolo ancora</h3>
            <p className="text-mid">I primi articoli saranno pubblicati presto.</p>
          </div>
        ) : (
          <>
            {/* Articolo hero */}
            {hero && (
              <Link href={`/blog/${hero.slug}`} className="block card overflow-hidden hover:shadow-card-hover transition-all mb-8 group">
                <div className="grid md:grid-cols-2">
                  <div className="relative h-64 md:h-auto bg-primary-50">
                    {hero.immagine_url ? (
                      <Image src={hero.immagine_url} alt={hero.titolo} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">📰</div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    {hero.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {hero.tags.slice(0, 2).map(t => (
                          <span key={t} className="badge bg-primary-50 text-primary-700">{t}</span>
                        ))}
                      </div>
                    )}
                    <h2 className="font-display text-2xl font-semibold text-dark mb-3 group-hover:text-primary-600 transition-colors">
                      {hero.titolo}
                    </h2>
                    <p className="text-mid text-sm leading-relaxed mb-4 line-clamp-3">{hero.estratto}</p>
                    <div className="flex items-center gap-4 text-xs text-mid">
                      <span>✍️ {hero.autore ?? 'Redazione'}</span>
                      <span>📅 {formatData(hero.pubblicato_il ?? hero.created_at)}</span>
                      <span>⏱ {tempoLettura(hero.contenuto)} min</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Griglia articoli */}
            {resto.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {resto.map(a => (
                  <Link key={a.id} href={`/blog/${a.slug}`}
                    className="card overflow-hidden hover:shadow-card-hover transition-all group flex flex-col">
                    <div className="relative h-44 bg-primary-50">
                      {a.immagine_url ? (
                        <Image src={a.immagine_url} alt={a.titolo} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📰</div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      {a.tags.length > 0 && (
                        <span className="badge bg-primary-50 text-primary-700 text-xs mb-2 self-start">
                          {a.tags[0]}
                        </span>
                      )}
                      <h3 className="font-semibold text-dark mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {a.titolo}
                      </h3>
                      <p className="text-sm text-mid line-clamp-2 flex-1 mb-3">{a.estratto}</p>
                      <p className="text-xs text-mid">
                        {formatData(a.pubblicato_il ?? a.created_at)} · {tempoLettura(a.contenuto)} min
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
