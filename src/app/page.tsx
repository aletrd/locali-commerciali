import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createAdminClient } from '@/lib/supabase'
import { CATEGORIE_INFO, CITTA_PRINCIPALI } from '@/types'
export const revalidate = 0
export const metadata: Metadata = {
  title: 'LocaliCommerciali.it — Negozi, Uffici e Locali Commerciali',
  description: 'Trova negozi, uffici, bar, magazzini e capannoni in vendita o affitto in tutta Italia.',
}
export const dynamic = 'force-dynamic'
const PIANI = [
  { id: 'gratuito', nome: 'Gratuito', prezzo: 0, features: ['1 annuncio attivo', 'Max 5 foto', '1.5% sulla vendita'], ev: false },
  { id: 'base', nome: 'Base', prezzo: 19, features: ['5 annunci attivi', 'Max 15 foto', 'Nessuna commissione'], ev: false },
  { id: 'pro', nome: 'Pro', prezzo: 49, features: ['Annunci illimitati', 'Foto illimitate', 'Badge in evidenza', 'Statistiche avanzate'], ev: true },
  { id: 'agenzia', nome: 'Agenzia', prezzo: 99, features: ['Tutto il piano Pro', 'Profilo verificato', 'Account manager'], ev: false },
]

export default async function HomePage() {
  const supabase = createAdminClient()
  const { data: ultimi } = await supabase.from('annunci').select('*').eq('attivo', true).order('created_at', { ascending: false }).limit(6)
  const { count: tot } = await supabase.from('annunci').select('*', { count: 'exact', head: true }).eq('attivo', true)
  const categorie = Object.entries(CATEGORIE_INFO)

  return (
    <>
      <Navbar />
      <main>
        <section style={{background:'linear-gradient(160deg,#083D2E,#0E6B4E)',padding:'48px 20px 56px',textAlign:'center'}}>
          <p style={{color:'rgba(255,255,255,0.7)',fontSize:13,marginBottom:12,fontWeight:500,letterSpacing:1,textTransform:'uppercase'}}>
            Portale #1 Locali Commerciali Italia
          </p>
          <h1 style={{fontSize:34,fontWeight:800,color:'white',lineHeight:1.2,marginBottom:12}}>
            Trova il locale<br/>commerciale ideale
          </h1>
          <p style={{fontSize:15,color:'rgba(255,255,255,0.7)',marginBottom:28,lineHeight:1.6}}>
            Negozi, uffici, bar, magazzini, capannoni.<br/>
            {tot ? `Oltre ${tot.toLocaleString('it-IT')} annunci verificati.` : 'In tutta Italia.'}
          </p>
          <form action="/annunci" method="get" style={{background:'white',borderRadius:16,padding:12,maxWidth:420,margin:'0 auto',boxShadow:'0 8px 32px rgba(0,0,0,0.2)'}}>
            <input name="citta" type="text" placeholder="📍 Città o zona..."
              style={{display:'block',width:'100%',border:'1px solid #E5E5EA',borderRadius:10,padding:'11px 14px',fontSize:15,marginBottom:8,boxSizing:'border-box' as const,outline:'none'}} />
            <div style={{display:'flex',gap:8,marginBottom:10}}>
              <select name="categoria" style={{flex:1,border:'1px solid #E5E5EA',borderRadius:10,padding:'11px 10px',fontSize:13,background:'white',color:'#1C1C1E',outline:'none'}}>
                <option value="">Categoria</option>
                {categorie.map(([v,i]) => <option key={v} value={v}>{i.emoji} {i.label}</option>)}
              </select>
              <select name="tipo" style={{flex:1,border:'1px solid #E5E5EA',borderRadius:10,padding:'11px 10px',fontSize:13,background:'white',color:'#1C1C1E',outline:'none'}}>
                <option value="">Tipo</option>
                <option value="vendita">Vendita</option>
                <option value="affitto">Affitto</option>
              </select>
            </div>
            <button type="submit" style={{display:'block',width:'100%',background:'#0A5C44',color:'white',border:'none',padding:'13px',borderRadius:10,fontSize:15,fontWeight:700,cursor:'pointer'}}>
              🔍 Cerca annunci
            </button>
          </form>
        </section>

        <section style={{background:'white',borderBottom:'1px solid #E5E5EA',padding:'16px 20px'}}>
          <div style={{maxWidth:500,margin:'0 auto',display:'flex',justifyContent:'space-around'}}>
            {[{val:tot?.toLocaleString('it-IT')||'0',label:'Annunci'},{val:'12+',label:'Città'},{val:'100%',label:'Verificati'}].map(s => (
              <div key={s.label} style={{textAlign:'center'}}>
                <div style={{fontSize:22,fontWeight:800,color:'#0A5C44'}}>{s.val}</div>
                <div style={{fontSize:11,color:'#8A8A8E',marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{padding:'40px 20px',maxWidth:800,margin:'0 auto'}}>
          <h2 style={{fontSize:22,fontWeight:700,marginBottom:20,color:'#1C1C1E'}}>Cerca per categoria</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
            {categorie.map(([slug,info]) => (
              <Link key={slug} href={`/annunci?categoria=${slug}`}
                style={{background:'white',border:'1px solid #E5E5EA',borderRadius:14,padding:'14px 8px',textAlign:'center',textDecoration:'none',color:'#1C1C1E',display:'block'}}>
                <div style={{fontSize:28,marginBottom:6}}>{info.emoji}</div>
                <div style={{fontSize:11,fontWeight:600}}>{info.label}</div>
              </Link>
            ))}
          </div>
        </section>

        {ultimi && ultimi.length > 0 && (
          <section style={{padding:'40px 20px',background:'#F5F5F7'}}>
            <div style={{maxWidth:800,margin:'0 auto'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                <h2 style={{fontSize:22,fontWeight:700,color:'#1C1C1E'}}>Ultimi annunci</h2>
                <Link href="/annunci" style={{color:'#0A5C44',fontWeight:600,textDecoration:'none',fontSize:14}}>Vedi tutti →</Link>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
                {ultimi.map((a:any) => (
                  <Link key={a.id} href={`/annunci/${a.id}`}
                    style={{background:'white',borderRadius:14,border:'1px solid #E5E5EA',overflow:'hidden',textDecoration:'none',color:'#1C1C1E',display:'block'}}>
                    <div style={{height:120,background:'linear-gradient(135deg,#F0F7F4,#E0F0E8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:44,position:'relative'}}>
                      {CATEGORIE_INFO[a.categoria as keyof typeof CATEGORIE_INFO]?.emoji ?? '🏢'}
                      <div style={{position:'absolute',top:8,left:8,background:a.tipo==='vendita'?'#0A5C44':'#059669',color:'white',padding:'3px 8px',borderRadius:999,fontSize:9,fontWeight:700}}>
                        {a.tipo==='vendita'?'Vendita':'Affitto'}
                      </div>
                    </div>
                    <div style={{padding:'12px 14px'}}>
                      <div style={{fontSize:16,fontWeight:800,color:'#0A5C44',marginBottom:4}}>
                        €{a.prezzo?.toLocaleString('it-IT')}{a.tipo==='affitto'?'/mese':''}
                      </div>
                      <div style={{fontSize:12,fontWeight:600,marginBottom:4,lineHeight:1.3}}>{a.titolo}</div>
                      <div style={{fontSize:11,color:'#8A8A8E'}}>📍 {a.citta}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section style={{padding:'40px 20px',maxWidth:800,margin:'0 auto'}}>
          <h2 style={{fontSize:22,fontWeight:700,marginBottom:20,color:'#1C1C1E'}}>Cerca nella tua città</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
            {CITTA_PRINCIPALI.map(c => (
              <Link key={c.slug} href={`/citta/${c.slug}`}
                style={{background:'white',border:'1px solid #E5E5EA',borderRadius:12,padding:'12px 8px',textAlign:'center',textDecoration:'none',color:'#1C1C1E',fontWeight:600,fontSize:13,display:'block'}}>
                {c.nome}
              </Link>
            ))}
          </div>
        </section>

        <section style={{padding:'40px 20px',background:'#F5F5F7'}}>
          <div style={{maxWidth:800,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:32}}>
              <h2 style={{fontSize:26,fontWeight:800,color:'#1C1C1E',marginBottom:6}}>Piani e prezzi</h2>
              <p style={{color:'#8A8A8E',fontSize:14}}>Inizia gratis, cresci quando vuoi</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
              {PIANI.map(p => (
                <div key={p.id} style={{background:p.ev?'#0A5C44':'white',border:p.ev?'none':'1px solid #E5E5EA',borderRadius:18,padding:'20px 16px',display:'flex',flexDirection:'column',position:'relative'}}>
                  {p.ev && <div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:'#C49A2A',color:'white',padding:'3px 12px',borderRadius:999,fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>⭐ Top</div>}
                  <h3 style={{fontSize:16,fontWeight:700,color:p.ev?'white':'#1C1C1E',marginBottom:4}}>{p.nome}</h3>
                  <div style={{fontSize:28,fontWeight:800,color:p.ev?'white':'#0A5C44',marginBottom:12}}>
                    {p.prezzo===0?'Gratis':`€${p.prezzo}`}
                    {p.prezzo>0&&<span style={{fontSize:12,fontWeight:400,color:p.ev?'rgba(255,255,255,0.6)':'#8A8A8E'}}>/mese</span>}
                  </div>
                  <ul style={{flex:1,marginBottom:16,listStyle:'none',padding:0}}>
                    {p.features.map(f => (
                      <li key={f} style={{fontSize:12,color:p.ev?'rgba(255,255,255,0.85)':'#3A3A3C',marginBottom:6,display:'flex',gap:6}}>
                        <span style={{color:'#C49A2A',flexShrink:0}}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link href={p.prezzo===0?'/registrati':'/prezzi'}
                    style={{display:'block',textAlign:'center',padding:'10px',borderRadius:10,fontWeight:600,fontSize:13,textDecoration:'none',background:p.ev?'#C49A2A':'transparent',color:p.ev?'white':'#0A5C44',border:p.ev?'none':'2px solid #0A5C44'}}>
                    {p.prezzo===0?'Inizia gratis':`Scegli ${p.nome}`}
                  </Link>
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
