import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createServerClient, createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard')

  const admin = createAdminClient()
  const { data: profilo } = await admin.from('profiles').select('*').eq('id', user.id).single()
  const { data: annunci } = await admin.from('annunci').select('*').eq('user_id', user.id).order('created_at', { ascending: false })

  const annunciAttivi = annunci?.filter((a: any) => a.attivo).length ?? 0

  return (
    <>
      <Navbar />
      <main style={{maxWidth:800,margin:'0 auto',padding:'32px 20px'}}>
        
        {/* Header */}
        <div style={{marginBottom:32}}>
          <h1 style={{fontSize:26,fontWeight:800,color:'#1C1C1E',marginBottom:4}}>
            Ciao, {profilo?.full_name?.split(' ')[0] ?? 'Utente'}! 👋
          </h1>
          <p style={{color:'#8A8A8E',fontSize:14}}>
            Piano {profilo?.piano ?? 'gratuito'} · {user.email}
          </p>
        </div>

        {/* Statistiche */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24}}>
          {[
            {label:'Annunci attivi', val:annunciAttivi},
            {label:'Visualizzazioni', val:0},
            {label:'Piano', val:profilo?.piano ?? 'gratuito'},
          ].map(s => (
            <div key={s.label} style={{background:'white',border:'1px solid #E5E5EA',borderRadius:14,padding:'16px 12px',textAlign:'center'}}>
              <div style={{fontSize:20,fontWeight:800,color:'#0A5C44'}}>{s.val}</div>
              <div style={{fontSize:11,color:'#8A8A8E',marginTop:4}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Banner upgrade */}
        {profilo?.piano === 'gratuito' && (
          <div style={{background:'#FFF8E6',border:'1px solid #F0D080',borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24,gap:12}}>
            <p style={{fontSize:14,color:'#1C1C1E',margin:0}}>Passa a un piano a pagamento per più annunci e zero commissioni.</p>
            <Link href="/prezzi" style={{background:'#C49A2A',color:'white',padding:'8px 16px',borderRadius:10,textDecoration:'none',fontSize:13,fontWeight:600,whiteSpace:'nowrap'}}>
              Upgrade
            </Link>
          </div>
        )}

        {/* Admin banner */}
        {profilo?.role === 'admin' && (
          <div style={{background:'#FFF0F0',border:'1px solid #FFB0B0',borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24,gap:12}}>
            <p style={{fontSize:14,fontWeight:600,color:'#1C1C1E',margin:0}}>🔑 Sei l'amministratore del sito</p>
            <Link href="/admin" style={{background:'#DC2626',color:'white',padding:'8px 16px',borderRadius:10,textDecoration:'none',fontSize:13,fontWeight:600}}>
              Pannello Admin
            </Link>
          </div>
        )}

        {/* Menu rapido */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:32}}>
          {[
            {href:'/crea-annuncio', icon:'➕', label:'Nuovo annuncio'},
            {href:'/chat', icon:'💬', label:'Messaggi'},
            {href:'/preferiti', icon:'❤️', label:'Preferiti'},
            {href:'/profilo', icon:'⚙️', label:'Impostazioni'},
          ].map(item => (
            <Link key={item.href} href={item.href}
              style={{background:'white',border:'1px solid #E5E5EA',borderRadius:14,padding:'16px',textDecoration:'none',color:'#1C1C1E',display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:22}}>{item.icon}</span>
              <span style={{fontSize:14,fontWeight:600}}>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Annunci */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h2 style={{fontSize:18,fontWeight:700,color:'#1C1C1E'}}>I miei annunci</h2>
          <Link href="/crea-annuncio" style={{background:'#0A5C44',color:'white',padding:'8px 16px',borderRadius:10,textDecoration:'none',fontSize:13,fontWeight:600}}>
            + Nuovo
          </Link>
        </div>

        {!annunci || annunci.length === 0 ? (
          <div style={{background:'white',border:'1px solid #E5E5EA',borderRadius:16,padding:'48px 24px',textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:12}}>📋</div>
            <h3 style={{fontSize:16,fontWeight:600,marginBottom:8}}>Nessun annuncio ancora</h3>
            <p style={{color:'#8A8A8E',fontSize:14,marginBottom:20}}>Pubblica il tuo primo annuncio gratuitamente</p>
            <Link href="/crea-annuncio" style={{background:'#0A5C44',color:'white',padding:'12px 24px',borderRadius:12,textDecoration:'none',fontWeight:600}}>
              Pubblica annuncio
            </Link>
          </div>
        ) : (
          <div style={{display:'grid',gap:12}}>
            {annunci.map((a: any) => (
              <div key={a.id} style={{background:'white',border:'1px solid #E5E5EA',borderRadius:14,padding:'16px',display:'flex',gap:14,alignItems:'center'}}>
                <div style={{width:56,height:56,background:'#F0F7F4',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>
                  🏢
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontWeight:600,fontSize:14,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.titolo}</p>
                  <p style={{fontSize:12,color:'#8A8A8E'}}>📍 {a.citta} · €{a.prezzo?.toLocaleString('it-IT')}</p>
                </div>
                <span style={{background:a.attivo?'#F0FFF4':'#FFF0F0',color:a.attivo?'#059669':'#DC2626',padding:'4px 10px',borderRadius:999,fontSize:11,fontWeight:600,flexShrink:0}}>
                  {a.attivo?'Attivo':'Inattivo'}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
