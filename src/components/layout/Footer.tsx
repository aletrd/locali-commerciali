import Link from 'next/link'
import { CITTA_PRINCIPALI, CATEGORIE_INFO } from '@/types'

export default function Footer() {
  const categorie = Object.entries(CATEGORIE_INFO)

  return (
    <footer className="bg-dark text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-1 mb-4">
              <span className="text-xl font-bold text-primary-400">Locali</span>
              <span className="text-xl font-bold text-accent-400">Commerciali</span>
              <span className="text-xl text-mid">.it</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Il portale italiano dedicato alla compravendita e locazione
              di immobili commerciali.
            </p>
            <div className="mt-6 space-y-1">
              <p className="text-xs text-gray-500">LocaliCommerciali.it S.r.l.</p>
              <p className="text-xs text-gray-500">P.IVA IT12345678901</p>
              <p className="text-xs text-gray-500">
                <a href="mailto:info@localicommerciali.it" className="hover:text-primary-400 transition-colors">
                  info@localicommerciali.it
                </a>
              </p>
            </div>
          </div>

          {/* Cerca per categoria */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Categorie</h3>
            <ul className="space-y-2">
              {categorie.map(([slug, info]) => (
                <li key={slug}>
                  <Link href={`/annunci?categoria=${slug}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors">
                    {info.emoji} {info.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Città principali */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Città principali</h3>
            <ul className="space-y-2">
              {CITTA_PRINCIPALI.slice(0, 8).map(c => (
                <li key={c.slug}>
                  <Link href={`/citta/${c.slug}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors">
                    Locali a {c.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Link utili */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Link utili</h3>
            <ul className="space-y-2">
              {[
                { href: '/prezzi', label: 'Piani e prezzi' },
                { href: '/blog', label: 'Blog e guide' },
                { href: '/mappa', label: 'Mappa annunci' },
                { href: '/crea-annuncio', label: 'Pubblica annuncio' },
                { href: '/registrati', label: 'Crea account' },
                { href: '/login', label: 'Accedi' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-sm font-semibold text-white mt-6 mb-4 uppercase tracking-wide">Legale</h3>
            <ul className="space-y-2">
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/termini', label: 'Termini di servizio' },
                { href: '/cookie', label: 'Cookie Policy' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} LocaliCommerciali.it — Tutti i diritti riservati
          </p>
          <p className="text-xs text-gray-600">
            Annunci pubblicitari non presenti · Dati degli inserzionisti non venduti
          </p>
        </div>
      </div>
    </footer>
  )
}
