import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createAdminClient } from '@/lib/supabase'
import { CATEGORIE_INFO, CITTA_PRINCIPALI } from '@/types'

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
        {/* HERO */}
        <section style={{background:'linear-gradient(135deg,#083D2E,#0A5C44)',color:'white',padding:'80px 24px',textAlign:'center'}}>
          <div style={{maxWidth:800,margin:'0 auto'}}>
            <h1 style={{fontSize:48,fontWeight:800,marginBottom:16,lineHeight:1.2}}>
              Trova il locale commerciale ideale
            </h1>
            <p style={{fontSize:18,opacity:0.8,marginBottom:32}}>
              Negozi, uffici, bar, magazzini e capannoni in vendita e in affitto in tutta Italia.
              {totaleAnnunci ? ` Oltre ${totaleAnnunci.toLocaleString('it-IT')} annunci.` : ''}
            </p>
            <form action="/annunci" method="get" style={{background:'white',borderRadius:16,padding:8,display:'flex',gap:8,maxWidth:700,margin:'0 auto',flexWrap:'wrap'}}>
              <input name="citta" type="text" placeholder="Città o zona..." style={{flex:1,minWidth:150,border:'none',outline:'none',padding:'10px 12px',fontSize:15,color:'#1C1C1E',background:'transparent'}} />
              <select name="categoria" style={{flex:1,minWidth:150,border:'none',outline:'none',padding:'10px 12px',fontSize:14,color:'#1C1C1E',background:'transparent'}}>
                <option value="">Tutte le categorie</option>
                {categorie.map(([v, i]) => <option key={v} value={v}>{i.emoji} {i.label}</option>)}
              </select>
              <button type="submit" style={{background:'#0A5C44',color:'white',border:'none',padding:'12px 24px',borderRadius:12,fontSize:15,fontWeight:600,cursor:'pointer'}}>Cerca</button>
            </form>
          </div>
        </section>

        {/* CATEGORIE */}
        <section style={{padding:'48px 24px',maxWidth:1200,margin:'0 auto'}}>
          <h2 style={{fontSize:28,fontWeight:700,marginBottom:24}}>Cerca per categoria</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:12}}>
            {categorie.map(([slug, info]) => (
              <Link key={slug} href={`/annunci?categoria=${slug}`} style={{background:'white',border:'1px solid #E5E5EA',borderRadius:14,padding:'16px 8px',textAlign:'center',textDecoration:'none',color:'#1C1C1E',display:'block'}}>
                <div style={{fontSize:32,marginBottom:8}}>{info.emoji}</div>
                <div style={{fontSize:13,fontWeight:600}}>{info.label}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* ULTIMI ANNUNCI */}
        {ultimi && ultimi.length > 0 && (
          <section style={{padding:'48px 24px',background:'#F5F5F7',maxWidth:'100%'}}>
            <div style={{maxWidth:1200,margin:'0 auto'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
                <h2 style={{fontSize:28,fontWeight:700}}>Ultimi annunci</h2>
                <Link href="/annunci" style={{color:'#0A5C44',fontWeight:600,textDecoration:'none'}}>Vedi tutti →</Link>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:20}}>
                {ultimi.map((a: any) => (
                  <Link key={a.id} href={`/annunci/${a.id}`} style={{background:'white',borderRadius:16,border:'1px solid #E5E5EA',overflow:'hidden',textDecoration:'none',color:'#1C1C1E',display:'block'}}>
                    <div style={{height:160,background:'#F0F7F4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:48}}>
                      {CATEGORIE_INFO[a.categoria as keyof typeof CATEGORIE_INFO]?.emoji ?? '🏢'}
                    </div>
                    <div style={{padding:16}}>
                      <div style={{fontSize:22,fontWeight:800,color:'#0A5C44',marginBottom:4}}>
                        €{a.prezzo?.toLocaleString('it-IT')}{a.tipo === 'affitto' ? '/mese' : ''}
                      </div>
                      <div style={{fontSize:14,fontWeight:600,marginBottom:4,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{a.titolo}</div>
                      <div style={{fontSize:12,color:'#8A8A8E'}}>📍 {a.citta}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CITTÀ */}
        <section style={{padding:'48px 24px',maxWidth:1200,margin:'0 auto'}}>
          <h2 style={{fontSize:28,fontWeight:700,marginBottom:24}}>Cerca nella tua città</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:12}}>
            {CITTA_PRINCIPALI.map(c => (
              <Link key={c.slug} href={`/citta/${c.slug}`} style={{background:'white',border:'1px solid #E5E5EA',borderRadius:14,padding:16,textAlign:'center',textDecoration:'none',color:'#1C1C1E',fontWeight:600,fontSize:14,display:'block'}}>
                📍 {c.nome}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
