import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createAdminClient } from '@/lib/supabase'
import { CATEGORIE_INFO } from '@/types'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ searchParams: p }: any): Promise<Metadata> {
  return { title: `Annunci Locali Commerciali | LocaliCommerciali.it` }
}

export default async function AnnunciPage({ searchParams: p }: any) {
  const supabase = createAdminClient()
  const pagina = parseInt(p.page ?? '1')
  const PER_PAGINA = 12
  const offset = (pagina - 1) * PER_PAGINA

  let query = supabase.from('annunci').select('*', { count: 'exact' }).eq('attivo', true)
  if (p.citta) query = query.ilike('citta', `%${p.citta}%`)
  if (p.categoria) query = query.eq('categoria', p.categoria)
  if (p.tipo) query = query.eq('tipo', p.tipo)
  if (p.prezzoMin) query = query.gte('prezzo', parseInt(p.prezzoMin))
  if (p.prezzoMax) query = query.lte('prezzo', parseInt(p.prezzoMax))

  const { data: annunci, count } = await query
    .order('in_evidenza', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + PER_PAGINA - 1)

  const totalePagine = Math.ceil((count ?? 0) / PER_PAGINA)
  const categorie = Object.entries(CATEGORIE_INFO)
  const filtriAttivi = [p.citta, p.categoria, p.tipo, p.prezzoMin, p.prezzoMax].filter(Boolean).length

  return (
    <>
      <Navbar />
      <main style={{maxWidth:1100,margin:'0 auto',padding:'24px 20px'}}>

        {/* Header */}
        <div style={{marginBottom:20}}>
          <h1 style={{fontSize:24,fontWeight:800,color:'#1C1C1E',marginBottom:4}}>
            {p.categoria ? `${CATEGORIE_INFO[p.categoria as keyof typeof CATEGORIE_INFO]?.emoji} ${CATEGORIE_INFO[p.categoria as keyof typeof CATEGORIE_INFO]?.label}` : '🏢 Tutti gli annunci'}
            {p.citta ? ` a ${p.citta}` : ''}
          </h1>
          <p style={{fontSize:14,color:'#8A8A8E'}}>{count ?? 0} annunci trovati</p>
        </div>

        {/* Filtri orizzontali */}
        <form method="get" action="/annunci"
          style={{background:'white',border:'1px solid #E5E5EA',borderRadius:16,padding:'16px',marginBottom:24}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:12}}>
            <input name="citta" defaultValue={p.citta ?? ''} placeholder="📍 Città"
              style={{border:'1px solid #E5E5EA',borderRadius:10,padding:'10px 12px',fontSize:14,outline:'none',background:'#F5F5F7'}} />
            <select name="categoria" defaultValue={p.categoria ?? ''}
              style={{border:'1px solid #E5E5EA',borderRadius:10,padding:'10px 12px',fontSize:14,outline:'none',background:'#F5F5F7',color:'#1C1C1E'}}>
              <option value="">Categoria</option>
              {categorie.map(([v,i]) => <option key={v} value={v}>{i.emoji} {i.label}</option>)}
            </select>
            <select name="tipo" defaultValue={p.tipo ?? ''}
              style={{border:'1px solid #E5E5EA',borderRadius:10,padding:'10px 12px',fontSize:14,outline:'none',background:'#F5F5F7',color:'#1C1C1E'}}>
              <option value="">Vendita o Affitto</option>
              <option value="vendita">In vendita</option>
              <option value="affitto">In affitto</option>
            </select>
            <div style={{display:'flex',gap:8}}>
              <input name="prezzoMin" type="number" defaultValue={p.prezzoMin ?? ''} placeholder="€ Min"
                style={{flex:1,border:'1px solid #E5E5EA',borderRadius:10,padding:'10px 12px',fontSize:14,outline:'none',background:'#F5F5F7'}} />
              <input name="prezzoMax" type="number" defaultValue={p.prezzoMax ?? ''} placeholder="€ Max"
                style={{flex:1,border:'1px solid #E5E5EA',borderRadius:10,padding:'10px 12px',fontSize:14,outline:'none',background:'#F5F5F7'}} />
            </div>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button type="submit"
              style={{flex:1,background:'#0A5C44',color:'white',border:'none',padding:'11px',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer'}}>
              🔍 Cerca
            </button>
            {filtriAttivi > 0 && (
              <Link href="/annunci"
                style={{padding:'11px 16px',borderRadius:10,border:'1px solid #E5E5EA',fontSize:13,color:'#8A8A8E',textDecoration:'none',whiteSpace:'nowrap',display:'flex',alignItems:'center'}}>
                ✕ Rimuovi filtri ({filtriAttivi})
              </Link>
            )}
          </div>
        </form>

        {/* Filtri rapidi categorie */}
        <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:8,marginBottom:20}}>
          <Link href="/annunci"
            style={{background:!p.categoria?'#0A5C44':'white',color:!p.categoria?'white':'#1C1C1E',border:'1px solid',borderColor:!p.categoria?'#0A5C44':'#E5E5EA',borderRadius:999,padding:'6px 14px',textDecoration:'none',fontSize:13,fontWeight:600,whiteSpace:'nowrap'}}>
            Tutti
          </Link>
          {categorie.map(([slug,info]) => (
            <Link key={slug}
              href={`/annunci?categoria=${slug}${p.citta?`&citta=${p.citta}`:''}${p.tipo?`&tipo=${p.tipo}`:''}`}
              style={{background:p.categoria===slug?'#0A5C44':'white',color:p.categoria===slug?'white':'#1C1C1E',border:'1px solid',borderColor:p.categoria===slug?'#0A5C44':'#E5E5EA',borderRadius:999,padding:'6px 14px',textDecoration:'none',fontSize:13,fontWeight:600,whiteSpace:'nowrap'}}>
              {info.emoji} {info.label}
            </Link>
          ))}
        </div>

        {/* Griglia annunci */}
        {!annunci || annunci.length === 0 ? (
          <div style={{background:'white',border:'1px solid #E5E5EA',borderRadius:20,padding:'64px 24px',textAlign:'center'}}>
            <div style={{fontSize:56,marginBottom:16}}>🔍</div>
            <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Nessun annuncio trovato</h3>
            <p style={{color:'#8A8A8E',fontSize:14,marginBottom:24}}>Prova a modificare i filtri di ricerca</p>
            <Link href="/annunci" style={{background:'#0A5C44',color:'white',padding:'12px 24px',borderRadius:12,textDecoration:'none',fontWeight:600}}>
              Rimuovi filtri
            </Link>
          </div>
        ) : (
          <>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
              {annunci.map((a:any) => (
                <Link key={a.id} href={`/annunci/${a.id}`}
                  style={{background:'white',borderRadius:16,border:'1px solid #E5E5EA',overflow:'hidden',textDecoration:'none',color:'#1C1C1E',display:'block'}}>
                  <div style={{height:140,background:'linear-gradient(135deg,#F0F7F4,#E0F0E8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:48,position:'relative'}}>
                    {CATEGORIE_INFO[a.categoria as keyof typeof CATEGORIE_INFO]?.emoji ?? '🏢'}
                    <div style={{position:'absolute',top:8,left:8,background:a.tipo==='vendita'?'#0A5C44':'#059669',color:'white',padding:'3px 8px',borderRadius:999,fontSize:10,fontWeight:700}}>
                      {a.tipo==='vendita'?'Vendita':'Affitto'}
                    </div>
                    {a.in_evidenza && (
                      <div style={{position:'absolute',top:8,right:8,background:'#C49A2A',color:'white',padding:'3px 8px',borderRadius:999,fontSize:10,fontWeight:700}}>
                        ⭐
                      </div>
                    )}
                  </div>
                  <div style={{padding:'12px 14px'}}>
                    <div style={{fontSize:17,fontWeight:800,color:'#0A5C44',marginBottom:4}}>
                      €{a.prezzo?.toLocaleString('it-IT')}{a.tipo==='affitto'?'/mese':''}
                    </div>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:6,lineHeight:1.3,color:'#1C1C1E'}}>{a.titolo}</div>
                    <div style={{fontSize:11,color:'#8A8A8E',display:'flex',gap:8,flexWrap:'wrap'}}>
                      <span>📍 {a.citta}</span>
                      {a.superficie_mq && <span>📐 {a.superficie_mq}mq</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Paginazione */}
            {totalePagine > 1 && (
              <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:24}}>
                {Array.from({length:totalePagine},(_, i) => i+1).map(n => {
                  const params = new URLSearchParams(p)
                  params.set('page', String(n))
                  return (
                    <Link key={n} href={`/annunci?${params.toString()}`}
                      style={{width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:10,textDecoration:'none',fontSize:14,fontWeight:600,background:n===pagina?'#0A5C44':'white',color:n===pagina?'white':'#1C1C1E',border:'1px solid',borderColor:n===pagina?'#0A5C44':'#E5E5EA'}}>
                      {n}
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
