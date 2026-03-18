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

const PIANI = [
  { id: 'gratuito', nome: 'Gratuito', prezzo: 0, features: ['1 annuncio attivo', 'Max 5 foto', '1.5% sulla vendita'], evidenziato: false },
  { id: 'base', nome: 'Base', prezzo: 19, features: ['5 annunci attivi', 'Max 15 foto', 'Nessuna commissione', 'Statistiche base'], evidenziato: false },
  { id: 'pro', nome: 'Pro', prezzo: 49, features: ['Annunci illimitati', 'Foto illimitate', 'Badge in evidenza', 'Statistiche avanzate'], evidenziato: true },
  { id: 'agenzia', nome: 'Agenzia', prezzo: 99, features: ['Tutto il piano Pro', 'Profilo verificato', 'Gestione team', 'Account manager'], evidenziato: false },
]

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
        <section style={{background:'linear-gradient(135deg,#083D2E 0%,#0A5C44 100%)',padding:'80px 24px',textAlign:'center'}}>
          <div style={{maxWidth:860,margin:'0 auto'}}>
            <div style={{display:'inline-block',background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:999,padding:'6px 16px',fontSize:13,color:'rgba(255,255,255,0.9)',marginBottom:24,fontWeight:500}}>
              ⭐ Il portale #1 per i locali commerciali in Italia
            </div>
            <h1 style={{fontSize:52,fontWeight:800,color:'white',lineHeight:1.15,marginBottom:20}}>
              Trova il locale<br/>commerciale ideale
            </h1>
            <p style={{fontSize:18,color:'rgba(255,255,255,0.75)',marginBottom:40,maxWidth:600,margin:'0 auto 40px'}}>
              Negozi, uffici, bar, magazzini e capannoni in vendita e affitto.
              {totaleAnnunci ? ` Oltre ${totaleAnnunci.toLocaleString('it-IT')} annunci verificati.` : ''}
            </p>
            <form action="/annunci" method="get" style={{background:'white',borderRadius:20,padding:10,display:'flex',gap:8,maxWidth:680,margin:'0 auto',boxShadow:'0 20px 60px rgba(0,0,0,0.2)',flexWrap:'wrap'}}>
              <input name="citta" type="text" placeholder="🏙️  Città o zona..." style={{flex:2,minWidth:160,border:'none',outline:'none',padding:'10px 14px',fontSize:15,color:'#1C1C1E',background:'transparent'}} />
              <select name="categoria" style={{flex:1,minWidth:140,border:'none',outline:'none',padding:'10px 8px',fontSize:14,color:'#1C1C1E',background:'transparent',borderLeft:'1px solid #E5E5EA'}}>
                <option value="">Tutte le categorie</option>
                {categorie.map(([v,i]) => <option key={v} value={v}>{i.emoji} {i.label}</option>)}
              </select>
              <select name="tipo" style={{minWidth:130,border:'none',outline:'none',padding:'10px 8px',fontSize:14,color:'#1C1C1E',background:'transparent',borderLeft:'1px solid #E5E5EA'}}>
                <option value="">Vendita/Affitto</option>
                <option value="vendita">In vendita</option>
                <option value="affitto">In affitto</option>
              </select>
              <button type="submit" style={{background:'#0A5C44',color:'white',border:'none',padding:'12px 28px',borderRadius:14,fontSize:15,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}>
                🔍 Cerca
              </button>
            </form>
          </div>
        </section>

        {/* STATISTICHE */}
        <section style={{background:'white',borderBottom:'1px solid #E5E5EA',padding:'20px 24px'}}>
          <div style={{maxWidth:1200,margin:'0 auto',display:'flex',justifyContent:'center',gap:60,flexWrap:'wrap'}}>
            {[
              {val: totaleAnnunci?.toLocaleString('it-IT') ?? '0', label:'Annunci attivi'},
              {val:'12+', label:'Città principali'},
              {val:'100%', label:'Annunci verificati'},
            ].map(s => (
              <div key={s.label} style={{textAlign:'center'}}>
                <div style={{fontSize:28,fontWeight:800,color:'#0A5C44'}}>{s.val}</div>
                <div style={{fontSize:13,color:'#8A8A8E',marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIE */}
        <section style={{padding:'60px 24px',maxWidth:1200,margin:'0 auto'}}>
          <h2 style={{fontSize:30,fontWeight:700,marginBottom:8,color:'#1C1C1E'}}>Cerca per categoria</h2>
          <p style={{color:'#8A8A8E',marginBottom:28,fontSize:15}}>Trova il tipo di locale che cerchi</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:14}}>
            {categorie.map(([slug,info]) => (
              <Link key={slug} href={`/annunci?categoria=${slug}`}
                style={{background:'white',border:'1px solid #E5E5EA',borderRadius:16,padding:'20px 12px',textAlign:'center',textDecoration:'none',color:'#1C1C1E',display:'block',transition:'all 0.2s'}}>
                <div style={{fontSize:36,marginBottom:10}}>{info.emoji}</div>
                <div style={{fontSize:13,fontWeight:600,color:'#1C1C1E'}}>{info.label}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* ULTIMI ANNUNCI */}
        {ultimi && ultimi.length > 0 && (
          <section style={{padding:'60px 24px',background:'#F5F5F7'}}>
            <div style={{maxWidth:1200,margin:'0 auto'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
                <div>
                  <h2 style={{fontSize:30,fontWeight:700,color:'#1C1C1E',marginBottom:4}}>Ultimi annunci</h2>
                  <p style={{color:'#8A8A8E',fontSize:15}}>Le ultime opportunità pubblicate</p>
                </div>
                <Link href="/annunci" style={{color:'#0A5C44',fontWeight:600,textDecoration:'none',fontSize:14,border:'1px solid #0A5C44',padding:'8px 16px',borderRadius:10}}>
                  Vedi tutti →
                </Link>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:20}}>
                {ultimi.map((a:any) => (
                  <Link key={a.id} href={`/annunci/${a.id}`}
                    style={{background:'white',borderRadius:18,border:'1px solid #E5E5EA',overflow:'hidden',textDecoration:'none',color:'#1C1C1E',display:'block'}}>
                    <div style={{height:180,background:'linear-gradient(135deg,#F0F7F4,#E8F5EF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:60,position:'relative'}}>
                      {CATEGORIE_INFO[a.categoria as keyof typeof CATEGORIE_INFO]?.emoji ?? '🏢'}
                      <div style={{position:'absolute',top:12,left:12,background:a.tipo==='vendita'?'#0A5C44':'#059669',color:'white',padding:'4px 10px',borderRadius:999,fontSize:11,fontWeight:700}}>
                        {a.tipo==='vendita'?'Vendita':'Affitto'}
                      </div>
                      {a.in_evidenza && (
                        <div style={{position:'absolute',top:12,right:12,background:'#C49A2A',color:'white',padding:'4px 10px',borderRadius:999,fontSize:11,fontWeight:700}}>
                          ⭐ Top
                        </div>
                      )}
                    </div>
                    <div style={{padding:'16px 18px'}}>
                      <div style={{fontSize:22,fontWeight:800,color:'#0A5C44',marginBottom:6}}>
                        €{a.prezzo?.toLocaleString('it-IT')}{a.tipo==='affitto'?'/mese':''}
                      </div>
                      <div style={{fontSize:14,fontWeight:600,marginBottom:8,lineHeight:1.4,color:'#1C1C1E'}}>{a.titolo}</div>
                      <div style={{fontSize:12,color:'#8A8A8E',display:'flex',gap:12,flexWrap:'wrap'}}>
                        <span>📍 {a.citta}</span>
                        {a.superficie_mq && <span>📐 {a.superficie_mq} mq</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CITTÀ */}
        <section style={{padding:'60px 24px',maxWidth:1200,margin:'0 auto'}}>
          <h2 style={{fontSize:30,fontWeight:700,marginBottom:8,color:'#1C1C1E'}}>Cerca nella tua città</h2>
          <p style={{color:'#8A8A8E',marginBottom:28,fontSize:15}}>Locali commerciali nelle principali città italiane</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:12}}>
            {CITTA_PRINCIPALI.map(c => (
              <Link key={c.slug} href={`/citta/${c.slug}`}
                style={{background:'white',border:'1px solid #E5E5EA',borderRadius:14,padding:'16px',textAlign:'center',textDecoration:'none',color:'#1C1C1E',fontWeight:600,fontSize:14,display:'block'}}>
                📍 {c.nome}
              </Link>
            ))}
          </div>
        </section>

        {/* PIANI */}
        <section style={{padding:'60px 24px',background:'#F5F5F7'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:48}}>
              <h2 style={{fontSize:36,fontWeight:800,color:'#1C1C1E',marginBottom:8}}>Piani per privati e agenzie</h2>
              <p style={{color:'#8A8A8E',fontSize:16}}>Inizia gratis, cresci quando vuoi</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:20}}>
              {PIANI.map(piano => (
                <div key={piano.id} style={{background:piano.evidenziato?'#0A5C44':'white',border:piano.evidenziato?'none':'1px solid #E5E5EA',borderRadius:20,padding:'28px 24px',display:'flex',flexDirection:'column',position:'relative'}}>
                  {piano.evidenziato && (
                    <div style={{position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',background:'#C49A2A',color:'white',padding:'4px 16px',borderRadius:999,fontSize:12,fontWeight:700,whiteSpace:'nowrap'}}>
                      ⭐ Più popolare
                    </div>
                  )}
                  <h3 style={{fontSize:22,fontWeight:700,color:piano.evidenziato?'white':'#1C1C1E',marginBottom:8}}>{piano.nome}</h3>
                  <div style={{fontSize:40,fontWeight:800,color:piano.evidenziato?'white':'#0A5C44',marginBottom:20}}>
                    {piano.prezzo===0?'Gratis':`€${piano.prezzo}`}
                    {piano.prezzo>0&&<span style={{fontSize:14,fontWeight:400,color:piano.evidenziato?'rgba(255,255,255,0.6)':'#8A8A8E'}}>/mese</span>}
                  </div>
                  <ul style={{flex:1,marginBottom:24,listStyle:'none',padding:0}}>
                    {piano.features.map(f => (
                      <li key={f} style={{fontSize:13,color:piano.evidenziato?'rgba(255,255,255,0.85)':'#3A3A3C',marginBottom:10,display:'flex',alignItems:'flex-start',gap:8}}>
                        <span style={{color:'#C49A2A',flexShrink:0}}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link href={piano.prezzo===0?'/registrati':'/prezzi'}
                    style={{display:'block',textAlign:'center',padding:'12px 16px',borderRadius:12,fontWeight:600,fontSize:14,textDecoration:'none',background:piano.evidenziato?'#C49A2A':'transparent',color:piano.evidenziato?'white':'#0A5C44',border:piano.evidenziato?'none':'2px solid #0A5C44'}}>
                    {piano.prezzo===0?'Inizia gratis':`Scegli ${piano.nome}`}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PERCHÉ NOI */}
        <section style={{padding:'60px 24px',maxWidth:1200,margin:'0 auto'}}>
          <h2 style={{fontSize:30,fontWeight:700,textAlign:'center',marginBottom:48,color:'#1C1C1E'}}>Perché scegliere LocaliCommerciali.it</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:32}}>
            {[
              {icon:'🛡️',titolo:'Annunci verificati',desc:'Ogni annuncio viene revisionato dal nostro team prima della pubblicazione.'},
              {icon:'📈',titolo:'Massima visibilità',desc:'I tuoi annunci vengono indicizzati su Google in pochi minuti.'},
              {icon:'🚫',titolo:'Zero pubblicità',desc:'Nessun banner, nessuna interruzione. Solo annunci veri.'},
            ].map(item => (
              <div key={item.titolo} style={{textAlign:'center'}}>
                <div style={{width:64,height:64,background:'#F0F7F4',borderRadius:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,margin:'0 auto 16px'}}>
                  {item.icon}
                </div>
                <h3 style={{fontSize:17,fontWeight:700,marginBottom:8,color:'#1C1C1E'}}>{item.titolo}</h3>
                <p style={{fontSize:14,color:'#8A8A8E',lineHeight:1.6}}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
