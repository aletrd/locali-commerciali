import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createAdminClient } from '@/lib/supabase'
import { CATEGORIE_INFO } from '@/types'

export const dynamic = 'force-dynamic'

interface Props { params: { id: string } }

export default async function AnnuncioPage({ params }: Props) {
  const supabase = createAdminClient()

  const { data: annuncio } = await supabase
    .from('annunci')
    .select('*, profiles(full_name, email, telefono, nome_agenzia)')
    .eq('id', params.id)
    .single()

  if (!annuncio) notFound()

  const cat = CATEGORIE_INFO[annuncio.categoria as keyof typeof CATEGORIE_INFO]
  const prezzo = `€${annuncio.prezzo?.toLocaleString('it-IT')}${annuncio.tipo === 'affitto' ? '/mese' : ''}`

  return (
    <>
      <Navbar />
      <main style={{maxWidth:900,margin:'0 auto',padding:'24px 20px'}}>

        {/* Breadcrumb */}
        <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:20,fontSize:13,color:'#8A8A8E'}}>
          <Link href="/" style={{color:'#8A8A8E',textDecoration:'none'}}>Home</Link>
          <span>›</span>
          <Link href="/annunci" style={{color:'#8A8A8E',textDecoration:'none'}}>Annunci</Link>
          <span>›</span>
          <span style={{color:'#1C1C1E',fontWeight:500}}>{annuncio.titolo}</span>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr',gap:20}}>

          {/* Foto o placeholder */}
          <div style={{borderRadius:20,overflow:'hidden',background:'linear-gradient(135deg,#F0F7F4,#E0F0E8)',height:260,display:'flex',alignItems:'center',justifyContent:'center',fontSize:90,position:'relative'}}>
            {annuncio.foto?.length > 0 ? (
              <img src={annuncio.foto[0]} alt={annuncio.titolo} style={{width:'100%',height:'100%',objectFit:'cover'}} />
            ) : (
              cat?.emoji ?? '🏢'
            )}
            <div style={{position:'absolute',top:16,left:16,display:'flex',gap:8}}>
              <span style={{background:annuncio.tipo==='vendita'?'#0A5C44':'#059669',color:'white',padding:'6px 14px',borderRadius:999,fontSize:12,fontWeight:700}}>
                {annuncio.tipo==='vendita'?'In vendita':'In affitto'}
              </span>
              {annuncio.in_evidenza && (
                <span style={{background:'#C49A2A',color:'white',padding:'6px 14px',borderRadius:999,fontSize:12,fontWeight:700}}>
                  ⭐ In evidenza
                </span>
              )}
            </div>
          </div>

          {/* Titolo e prezzo */}
          <div>
            <h1 style={{fontSize:24,fontWeight:800,color:'#1C1C1E',marginBottom:8,lineHeight:1.3}}>
              {annuncio.titolo}
            </h1>
            <div style={{fontSize:30,fontWeight:800,color:'#0A5C44',marginBottom:20}}>{prezzo}</div>

            {/* Info rapide */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
              {[
                {icon:'📍', label:'Città', val:annuncio.citta},
                {icon:'🏷️', label:'Categoria', val:cat?.label ?? annuncio.categoria},
                ...(annuncio.superficie_mq ? [{icon:'📐', label:'Superficie', val:`${annuncio.superficie_mq} mq`}] : []),
              ].map(item => (
                <div key={item.label} style={{background:'#F5F5F7',borderRadius:12,padding:'12px 8px',textAlign:'center'}}>
                  <div style={{fontSize:18,marginBottom:4}}>{item.icon}</div>
                  <div style={{fontSize:10,color:'#8A8A8E',marginBottom:2}}>{item.label}</div>
                  <div style={{fontSize:12,fontWeight:600,color:'#1C1C1E'}}>{item.val}</div>
                </div>
              ))}
            </div>

            {/* Box contatto */}
            <div style={{background:'white',border:'1px solid #E5E5EA',borderRadius:20,padding:'20px',marginBottom:20}}>
              <h3 style={{fontSize:15,fontWeight:700,marginBottom:16,color:'#1C1C1E'}}>
                👤 {annuncio.profiles?.nome_agenzia ?? annuncio.profiles?.full_name ?? 'Inserzionista'}
              </h3>
              {annuncio.profiles?.telefono && (
                <a href={`tel:${annuncio.profiles.telefono}`}
                  style={{display:'block',width:'100%',background:'#0A5C44',color:'white',padding:'14px',borderRadius:12,fontSize:15,fontWeight:700,textDecoration:'none',textAlign:'center',marginBottom:10,boxSizing:'border-box' as const}}>
                  📞 Chiama
                </a>
              )}
              <a href={`https://wa.me/${annuncio.profiles?.telefono?.replace(/\D/g,'')}`} target="_blank"
                style={{display:'block',width:'100%',background:'#25D366',color:'white',padding:'14px',borderRadius:12,fontSize:15,fontWeight:700,textDecoration:'none',textAlign:'center',marginBottom:10,boxSizing:'border-box' as const}}>
                💬 WhatsApp
              </a>
              <a href={`mailto:${annuncio.profiles?.email}`}
                style={{display:'block',width:'100%',background:'transparent',color:'#0A5C44',border:'2px solid #0A5C44',padding:'12px',borderRadius:12,fontSize:15,fontWeight:700,textDecoration:'none',textAlign:'center',boxSizing:'border-box' as const}}>
                ✉️ Scrivi email
              </a>
            </div>

            {/* Descrizione */}
            {annuncio.descrizione && (
              <div style={{background:'white',border:'1px solid #E5E5EA',borderRadius:16,padding:'20px',marginBottom:20}}>
                <h2 style={{fontSize:16,fontWeight:700,marginBottom:12,color:'#1C1C1E'}}>Descrizione</h2>
                <p style={{fontSize:14,color:'#3A3A3C',lineHeight:1.8,whiteSpace:'pre-wrap'}}>{annuncio.descrizione}</p>
              </div>
            )}

            {/* Indirizzo */}
            <div style={{background:'white',border:'1px solid #E5E5EA',borderRadius:16,padding:'20px',marginBottom:20}}>
              <h2 style={{fontSize:16,fontWeight:700,marginBottom:8,color:'#1C1C1E'}}>📍 Posizione</h2>
              <p style={{fontSize:14,color:'#3A3A3C'}}>{annuncio.indirizzo}, {annuncio.citta} {annuncio.cap ? `(${annuncio.cap})` : ''}</p>
            </div>

            {/* Riepilogo */}
            <div style={{background:'#F5F5F7',borderRadius:16,padding:'16px'}}>
              <div style={{fontSize:12,color:'#8A8A8E',marginBottom:12,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>Riepilogo annuncio</div>
              {[
                ['Tipo operazione', annuncio.tipo === 'vendita' ? 'Vendita' : 'Affitto'],
                ['Prezzo', prezzo],
                ['Categoria', cat?.label ?? annuncio.categoria],
                ['Città', annuncio.citta],
                ...(annuncio.superficie_mq ? [['Superficie', `${annuncio.superficie_mq} mq`]] : []),
                ['Pubblicato', new Date(annuncio.created_at).toLocaleDateString('it-IT')],
              ].map(([k,v]) => (
                <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #E5E5EA',fontSize:13}}>
                  <span style={{color:'#8A8A8E'}}>{k}</span>
                  <span style={{fontWeight:600,color:'#1C1C1E'}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
// v2
