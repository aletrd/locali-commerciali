'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function Navbar() {
  const [utente, setUtente] = useState<any>(null)
  const [menuAperto, setMenuAperto] = useState(false)
  const [mobileAperto, setMobileAperto] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUtente(user))
  }, [])

  async function esci() {
    await supabase.auth.signOut()
    setUtente(null)
    router.push('/')
    router.refresh()
  }

  return (
    <nav style={{background:'white',borderBottom:'1px solid #E5E5EA',position:'sticky',top:0,zIndex:50,boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 24px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        
        {/* Logo */}
        <Link href="/" style={{textDecoration:'none',display:'flex',alignItems:'center',gap:2}}>
          <span style={{fontSize:20,fontWeight:800,color:'#0A5C44'}}>Locali</span>
          <span style={{fontSize:20,fontWeight:800,color:'#C49A2A'}}>Commerciali</span>
          <span style={{fontSize:20,fontWeight:400,color:'#8A8A8E'}}>.it</span>
        </Link>

        {/* Link desktop */}
        <div style={{display:'flex',alignItems:'center',gap:28}} className="desktop-nav">
          {[
            {href:'/annunci',label:'Annunci'},
            {href:'/prezzi',label:'Prezzi'},
            {href:'/blog',label:'Blog'},
          ].map(l => (
            <Link key={l.href} href={l.href} style={{textDecoration:'none',color:'#3A3A3C',fontSize:14,fontWeight:500}}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Azioni */}
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {utente ? (
            <>
              <div style={{position:'relative'}}>
                <button onClick={() => setMenuAperto(!menuAperto)}
                  style={{display:'flex',alignItems:'center',gap:8,background:'#F0F7F4',border:'none',padding:'8px 14px',borderRadius:12,cursor:'pointer',fontSize:14,fontWeight:500,color:'#0A5C44'}}>
                  <div style={{width:24,height:24,background:'#0A5C44',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:12,fontWeight:700}}>
                    {utente.email?.charAt(0).toUpperCase()}
                  </div>
                  Account
                </button>
                {menuAperto && (
                  <div style={{position:'absolute',right:0,top:'calc(100% + 8px)',background:'white',border:'1px solid #E5E5EA',borderRadius:16,boxShadow:'0 4px 20px rgba(0,0,0,0.1)',minWidth:200,overflow:'hidden',zIndex:100}}>
                    <Link href="/dashboard" onClick={() => setMenuAperto(false)} style={{display:'block',padding:'12px 16px',textDecoration:'none',color:'#1C1C1E',fontSize:14,borderBottom:'1px solid #F5F5F7'}}>
                      📊 Dashboard
                    </Link>
                    <Link href="/profilo" onClick={() => setMenuAperto(false)} style={{display:'block',padding:'12px 16px',textDecoration:'none',color:'#1C1C1E',fontSize:14,borderBottom:'1px solid #F5F5F7'}}>
                      ⚙️ Impostazioni
                    </Link>
                    <button onClick={esci} style={{display:'block',width:'100%',textAlign:'left',padding:'12px 16px',border:'none',background:'none',color:'#DC2626',fontSize:14,cursor:'pointer'}}>
                      🚪 Esci
                    </button>
                  </div>
                )}
              </div>
              <Link href="/crea-annuncio" style={{background:'#0A5C44',color:'white',padding:'10px 18px',borderRadius:12,textDecoration:'none',fontSize:14,fontWeight:600}}>
                + Pubblica
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" style={{textDecoration:'none',color:'#3A3A3C',fontSize:14,fontWeight:500}}>
                Accedi
              </Link>
              <Link href="/registrati" style={{background:'#0A5C44',color:'white',padding:'10px 18px',borderRadius:12,textDecoration:'none',fontSize:14,fontWeight:600}}>
                Registrati gratis
              </Link>
            </>
          )}
          
          {/* Hamburger mobile */}
          <button onClick={() => setMobileAperto(!mobileAperto)}
            style={{background:'none',border:'none',cursor:'pointer',padding:4,display:'none'}}
            className="mobile-menu-btn">
            <div style={{width:22,height:2,background:'#1C1C1E',marginBottom:5,borderRadius:2}}></div>
            <div style={{width:22,height:2,background:'#1C1C1E',marginBottom:5,borderRadius:2}}></div>
            <div style={{width:22,height:2,background:'#1C1C1E',borderRadius:2}}></div>
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileAperto && (
        <div style={{background:'white',borderTop:'1px solid #E5E5EA',padding:'16px 24px'}}>
          {[{href:'/annunci',label:'Annunci'},{href:'/prezzi',label:'Prezzi'},{href:'/blog',label:'Blog'}].map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMobileAperto(false)}
              style={{display:'block',padding:'10px 0',textDecoration:'none',color:'#1C1C1E',fontSize:15,fontWeight:500,borderBottom:'1px solid #F5F5F7'}}>
              {l.label}
            </Link>
          ))}
          {utente ? (
            <Link href="/dashboard" style={{display:'block',marginTop:12,background:'#0A5C44',color:'white',padding:'12px',borderRadius:12,textDecoration:'none',textAlign:'center',fontWeight:600}}>
              Dashboard
            </Link>
          ) : (
            <Link href="/registrati" style={{display:'block',marginTop:12,background:'#0A5C44',color:'white',padding:'12px',borderRadius:12,textDecoration:'none',textAlign:'center',fontWeight:600}}>
              Registrati gratis
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
