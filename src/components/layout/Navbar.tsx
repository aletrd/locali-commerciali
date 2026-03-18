'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, MessageSquare, Heart, User, LogOut, Settings, FileText, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { Profilo } from '@/types'

export default function Navbar() {
  const [aperto, setAperto] = useState(false)
  const [profilo, setProfilo] = useState<Profilo | null>(null)
  const [menuUtente, setMenuUtente] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfilo(data)
    })
  }, [])

  async function esci() {
    await supabase.auth.signOut()
    setProfilo(null)
    router.push('/')
    router.refresh()
  }

  const links = [
    { href: '/annunci', label: 'Annunci' },
    { href: '/mappa', label: 'Mappa' },
    { href: '/prezzi', label: 'Prezzi' },
    { href: '/blog', label: 'Blog' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <span className="text-xl font-bold text-primary-600">Locali</span>
            <span className="text-xl font-bold text-accent-500">Commerciali</span>
            <span className="text-xl text-mid">.it</span>
          </Link>

          {/* Link desktop */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(l => (
              <Link key={l.href} href={l.href}
                className={cn('text-sm font-medium transition-colors',
                  pathname === l.href ? 'text-primary-600' : 'text-dark-mid hover:text-primary-600')}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Azioni destra */}
          <div className="hidden md:flex items-center gap-3">
            {profilo ? (
              <>
                <Link href="/chat" className="relative p-2 text-mid hover:text-primary-600 transition-colors">
                  <MessageSquare size={20} />
                </Link>
                <Link href="/preferiti" className="p-2 text-mid hover:text-primary-600 transition-colors">
                  <Heart size={20} />
                </Link>
                {/* Menu utente */}
                <div className="relative">
                  <button onClick={() => setMenuUtente(!menuUtente)}
                    className="flex items-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 px-3 py-2 rounded-xl transition-colors">
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {(profilo.full_name ?? profilo.email).charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium max-w-24 truncate">
                      {profilo.full_name?.split(' ')[0] ?? 'Account'}
                    </span>
                  </button>
                  {menuUtente && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-card-hover overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-mid">{profilo.email}</p>
                        <p className="text-xs font-semibold text-primary-600 mt-0.5">
                          Piano {profilo.piano.charAt(0).toUpperCase() + profilo.piano.slice(1)}
                        </p>
                      </div>
                      {[
                        { href: '/dashboard', icon: User, label: 'Dashboard' },
                        { href: '/dashboard/annunci', icon: FileText, label: 'I miei annunci' },
                        { href: '/dashboard/fatture', icon: FileText, label: 'Fatture' },
                        { href: '/profilo', icon: Settings, label: 'Impostazioni' },
                        ...(profilo.role === 'admin' ? [{ href: '/admin', icon: Star, label: 'Pannello Admin' }] : []),
                      ].map(item => (
                        <Link key={item.href} href={item.href}
                          onClick={() => setMenuUtente(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-dark hover:bg-gray-50 transition-colors">
                          <item.icon size={16} className="text-mid" />
                          {item.label}
                        </Link>
                      ))}
                      <button onClick={esci}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100">
                        <LogOut size={16} />
                        Esci
                      </button>
                    </div>
                  )}
                </div>
                <Link href="/crea-annuncio" className="btn-primary text-sm py-2 px-4">
                  + Pubblica
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-dark-mid hover:text-primary-600">
                  Accedi
                </Link>
                <Link href="/crea-annuncio" className="btn-primary text-sm py-2 px-4">
                  Pubblica annuncio
                </Link>
              </>
            )}
          </div>

          {/* Hamburger mobile */}
          <button className="md:hidden p-2" onClick={() => setAperto(!aperto)}>
            {aperto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {aperto && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setAperto(false)}
              className="block py-2.5 text-sm font-medium text-dark hover:text-primary-600">
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            {profilo ? (
              <>
                <Link href="/dashboard" onClick={() => setAperto(false)}
                  className="block py-2.5 text-sm font-medium text-dark">Dashboard</Link>
                <button onClick={esci} className="text-sm text-red-600 font-medium">Esci</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2.5 text-sm font-medium text-dark">Accedi</Link>
                <Link href="/registrati" className="btn-primary text-sm py-2.5 w-full justify-center">
                  Registrati gratis
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
