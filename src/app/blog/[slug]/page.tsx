import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createServerClient } from '@/lib/supabase'
import { formatData, tempoLettura } from '@/lib/utils'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerClient()
  const { data: a } = await supabase
    .from('blog_articoli').select('titolo, estratto, immagine_url, autore, pubblicato_il')
    .eq('slug', params.slug).eq('pubblicato', true).single()

  if (!a) return { title: 'Articolo non trovato' }

  return {
    title: a.titolo,
    description: a.estratto,
    authors: a.autore ? [{ name: a.autore }] : undefined,
    openGraph: {
      type: 'article',
      title: a.titolo,
      description: a.estratto,
      images: a.immagine_url ? [a.immagine_url] : [],
      publishedTime: a.pubblicato_il ?? undefined,
    },
  }
}

export default async function ArticoloPage({ params }: Props) {
  const supabase = createServerClient()

  const { data: articolo } = await supabase
    .from('blog_articoli').select('*')
    .eq('slug', params.slug).eq('pubblicato', true).single()

  if (!articolo) notFound()

  // Articoli correlati
  const { data: correlati } = await supabase
    .from('blog_articoli').select('id, titolo, slug, estratto, immagine_url, tags, pubblicato_il, contenuto, created_at')
    .eq('pubblicato', true).neq('id', articolo.id)
    .overlaps('tags', articolo.tags)
    .limit(3)

  // Schema.org Article
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: articolo.titolo,
    description: articolo.estratto,
    url: `https://www.localicommerciali.it/blog/${articolo.slug}`,
    datePublished: articolo.pubblicato_il ?? articolo.created_at,
    image: articolo.immagine_url,
    author: articolo.autore ? { '@type': 'Person', name: articolo.autore } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'LocaliCommerciali.it',
      logo: { '@type': 'ImageObject', url: 'https://www.localicommerciali.it/icons/icon-512.png' },
    },
    keywords: articolo.tags.join(', '),
    inLanguage: 'it-IT',
  }

  // Rendering markdown base
  function renderContenuto(testo: string) {
    return testo.split('\n').map((riga, i) => {
      if (riga.startsWith('## ')) return <h2 key={i} className="font-display text-2xl font-semibold text-dark mt-10 mb-4">{riga.slice(3)}</h2>
      if (riga.startsWith('### ')) return <h3 key={i} className="text-xl font-semibold text-dark mt-8 mb-3">{riga.slice(4)}</h3>
      if (riga.startsWith('- ')) return (
        <li key={i} className="flex items-start gap-2 mb-2 text-dark-mid">
          <span className="text-primary-600 mt-1 shrink-0">•</span>
          <span>{riga.slice(2)}</span>
        </li>
      )
      if (riga.trim() === '') return <div key={i} className="h-4" />
      return <p key={i} className="text-dark-mid leading-relaxed mb-4">{riga}</p>
    })
  }

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="max-w-3xl mx-auto px-4 py-12">

        {/* Tags */}
        {articolo.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {articolo.tags.map((t: string) => (
              <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`}
                className="badge bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors">
                {t}
              </Link>
            ))}
          </div>
        )}

        {/* Titolo */}
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-dark mb-6 leading-tight">
          {articolo.titolo}
        </h1>

        {/* Meta autore */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
            {(articolo.autore ?? 'R').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-dark text-sm">{articolo.autore ?? 'Redazione LocaliCommerciali.it'}</p>
            <p className="text-xs text-mid">
              {formatData(articolo.pubblicato_il ?? articolo.created_at)} · {tempoLettura(articolo.contenuto)} min di lettura
            </p>
          </div>
        </div>

        {/* Immagine */}
        {articolo.immagine_url && (
          <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden mb-10">
            <Image src={articolo.immagine_url} alt={articolo.titolo} fill className="object-cover" />
          </div>
        )}

        {/* Contenuto */}
        <article className="prose-custom">
          {renderContenuto(articolo.contenuto)}
        </article>

        {/* CTA */}
        <div className="bg-primary-50 rounded-2xl p-8 mt-12 text-center">
          <h3 className="font-display text-2xl font-semibold text-dark mb-3">
            Cerchi un locale commerciale?
          </h3>
          <p className="text-mid mb-6">Sfoglia migliaia di annunci verificati in tutta Italia.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/annunci" className="btn-primary">Cerca annunci</Link>
            <Link href="/crea-annuncio" className="btn-outline">Pubblica gratis</Link>
          </div>
        </div>

        {/* Articoli correlati */}
        {correlati && correlati.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-semibold text-dark mb-6">Articoli correlati</h2>
            <div className="grid gap-4">
              {correlati.map((a: any) => (
                <Link key={a.id} href={`/blog/${a.slug}`}
                  className="card p-5 hover:shadow-card-hover transition-all flex gap-4 items-start group">
                  <div className="w-20 h-20 bg-primary-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    📰
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-dark mb-1 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {a.titolo}
                    </h3>
                    <p className="text-sm text-mid line-clamp-2">{a.estratto}</p>
                    <p className="text-xs text-mid mt-2">
                      {formatData(a.pubblicato_il ?? a.created_at)} · {tempoLettura(a.contenuto)} min
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
