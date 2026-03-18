import Link from 'next/link'
import { CITTA_PRINCIPALI, CATEGORIE_INFO } from '@/types'

export default function Footer() {
  const categorie = Object.entries(CATEGORIE_INFO)
  return (
    <footer style={{background:'#1C1C1E',color:'white',marginTop:80}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'64px 24px 32px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:40,marginBottom:48}}>
          
          <div>
            <div style={{display:'flex',alignItems:'center',gap:2,marginBottom:16}}>
              <span style={{fontSize:18,fontWeight:800,color:'#4ade80'}}>Locali</span>
              <span style={{fontSize:18,fontWeight:800,color:'#C49A2A'}}>Commerciali</span>
              <span style={{fontSize:18,color:'#8A8A8E'}}>.it</span>
            </div>
            <p style={{fontSize:13,color:'#8A8A8E',lineHeight:1.6,marginBottom:16}}>
              Il portale italiano per comprare, vendere e affittare locali commerciali.
            </p>
            <p style={{fontSize:12,color:'#5A5A5E'}}>P.IVA IT12345678901</p>
            <a href="mailto:info@localicommerciali.it" style={{fontSize:12,color:'#5A5A5E',textDecoration:'none'}}>
              info@localicommerciali.it
            </a>
          </div>

          <div>
            <h3 style={{fontSize:12,fontWeight:700,color:'white',marginBottom:16,textTransform:'uppercase',letterSpacing:1}}>Categorie</h3>
            {categorie.map(([slug, info]) => (
              <Link key={slug} href={`/annunci?categoria=${slug}`} style={{display:'block',color:'#8A8A8E',textDecoration:'none',fontSize:13,marginBottom:8}}>
                {info.emoji} {info.label}
              </Link>
            ))}
          </div>

          <div>
            <h3 style={{fontSize:12,fontWeight:700,color:'white',marginBottom:16,textTransform:'uppercase',letterSpacing:1}}>Città</h3>
            {CITTA_PRINCIPALI.slice(0,8).map(c => (
              <Link key={c.slug} href={`/citta/${c.slug}`} style={{display:'block',color:'#8A8A8E',textDecoration:'none',fontSize:13,marginBottom:8}}>
                {c.nome}
              </Link>
            ))}
          </div>

          <div>
            <h3 style={{fontSize:12,fontWeight:700,color:'white',marginBottom:16,textTransform:'uppercase',letterSpacing:1}}>Link utili</h3>
            {[
              {href:'/prezzi',label:'Piani e prezzi'},
              {href:'/blog',label:'Blog'},
              {href:'/crea-annuncio',label:'Pubblica annuncio'},
              {href:'/registrati',label:'Crea account'},
              {href:'/login',label:'Accedi'},
              {href:'/privacy',label:'Privacy Policy'},
              {href:'/termini',label:'Termini di servizio'},
            ].map(l => (
              <Link key={l.href} href={l.href} style={{display:'block',color:'#8A8A8E',textDecoration:'none',fontSize:13,marginBottom:8}}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{borderTop:'1px solid #2C2C2E',paddingTop:24,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
          <p style={{fontSize:12,color:'#5A5A5E'}}>
            © {new Date().getFullYear()} LocaliCommerciali.it — Tutti i diritti riservati
          </p>
          <p style={{fontSize:12,color:'#5A5A5E'}}>
            Nessuna pubblicità · Dati non venduti
          </p>
        </div>
      </div>
    </footer>
  )
}
