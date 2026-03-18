import { createAdminClient } from '@/lib/supabase'
import { CITTA_PRINCIPALI, CATEGORIE_INFO } from '@/types'
import { NextResponse } from 'next/server'

const BASE = 'https://www.localicommerciali.it'
const oggi = new Date().toISOString().split('T')[0]

export async function GET() {
  const supabase = createAdminClient()

  const [{ data: annunci }, { data: articoli }] = await Promise.all([
    supabase.from('annunci').select('id, updated_at').eq('attivo', true).limit(5000),
    supabase.from('blog_articoli').select('slug, pubblicato_il').eq('pubblicato', true),
  ])

  const categorie = Object.keys(CATEGORIE_INFO)

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE}/</loc><lastmod>${oggi}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${BASE}/annunci</loc><lastmod>${oggi}</lastmod><changefreq>hourly</changefreq><priority>0.9</priority></url>
  <url><loc>${BASE}/mappa</loc><lastmod>${oggi}</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url>
  <url><loc>${BASE}/prezzi</loc><lastmod>${oggi}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>${BASE}/blog</loc><lastmod>${oggi}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>
${CITTA_PRINCIPALI.map(c => `  <url><loc>${BASE}/citta/${c.slug}</loc><lastmod>${oggi}</lastmod><changefreq>daily</changefreq><priority>0.85</priority></url>`).join('\n')}
${categorie.map(c => `  <url><loc>${BASE}/annunci?categoria=${c}</loc><lastmod>${oggi}</lastmod><changefreq>daily</changefreq><priority>0.75</priority></url>`).join('\n')}
${CITTA_PRINCIPALI.slice(0, 10).flatMap(c => categorie.map(cat =>
  `  <url><loc>${BASE}/annunci?citta=${c.slug}&amp;categoria=${cat}</loc><lastmod>${oggi}</lastmod><changefreq>daily</changefreq><priority>0.65</priority></url>`
)).join('\n')}
${(annunci ?? []).map(a => `  <url><loc>${BASE}/annunci/${a.id}</loc><lastmod>${a.updated_at?.split('T')[0] ?? oggi}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`).join('\n')}
${(articoli ?? []).map(a => `  <url><loc>${BASE}/blog/${a.slug}</loc><lastmod>${a.pubblicato_il?.split('T')[0] ?? oggi}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
    },
  })
}
