import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BarChart2, FileText, Star, MessageSquare, Heart, Settings, LogOut, Plus } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AnnuncioCard from '@/components/annunci/AnnuncioCard'
import { createServerClient } from '@/lib/supabase'
import { PIANI_INFO } from '@/types'

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard')

  const [{ data: profilo }, { data: annunci }, { data: messaggiNonLetti }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('annunci').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('chat_messaggi').select('id', { count: 'exact' })
      .eq('letto', false).neq('mittente', user.id),
  ])

  const pianoInfo = PIANI_INFO.find(p => p.id === profilo?.piano)
  const annunciAttivi = annunci?.filter(a => a.attivo).length ?? 0
  const totVis = annunci?.reduce((s, a) => s + (a.visualizzazioni ?? 0), 0) ?? 0
  const limiteAnnunci = pianoInfo?.id === 'gratuito' ? 1
    : pianoInfo?.id === 'base' ? 5 : 999

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              {/* Avatar + info */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {(profilo?.full_name ?? user.email ?? 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark truncate">{profilo?.full_name ?? 'Utente'}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="badge bg-primary-50 text-primary-700 text-xs">
                      Piano {profilo?.piano}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu */}
              <nav className="space-y-1">
                {[
                  { href: '/dashboard', icon: BarChart2, label: 'Dashboard' },
                  { href: '/dashboard/annunci', icon: FileText, label: 'I miei annunci' },
                  { href: '/chat', icon: MessageSquare, label: 'Messaggi', badge: messaggiNonLetti?.length ?? 0 },
                  { href: '/preferiti', icon: Heart, label: 'Preferiti' },
                  { href: '/dashboard/fatture', icon: FileText, label: 'Fatture' },
                  { href: '/profilo', icon: Settings, label: 'Impostazioni' },
                  ...(profilo?.role === 'admin' ? [{ href: '/admin', icon: Star, label: '🔑 Admin' }] : []),
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-dark-mid hover:bg-gray-50 hover:text-primary-600 transition-colors">
                    <item.icon size={17} />
                    <span className="flex-1">{item.label}</span>
                    {(item as any).badge > 0 && (
                      <span className="badge bg-primary-600 text-white text-xs">{(item as any).badge}</span>
                    )}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Contenuto principale */}
          <div className="lg:col-span-3 space-y-6">

            {/* Statistiche */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Annunci attivi', val: `${annunciAttivi} / ${limiteAnnunci === 999 ? '∞' : limiteAnnunci}` },
                { label: 'Visualizzazioni totali', val: totVis.toLocaleString('it-IT') },
                { label: 'Messaggi non letti', val: messaggiNonLetti?.length ?? 0 },
              ].map(s => (
                <div key={s.label} className="card p-5 text-center">
                  <p className="text-2xl font-extrabold text-primary-600">{s.val}</p>
                  <p className="text-xs text-mid mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Banner piano */}
            {profilo?.piano === 'gratuito' && (
              <div className="card p-5 bg-amber-50 border-amber-200 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-dark">Stai usando il piano Gratuito</p>
                  <p className="text-sm text-mid mt-0.5">
                    Passa a Base per 5 annunci senza commissioni, o a Pro per annunci illimitati.
                  </p>
                </div>
                <Link href="/prezzi" className="btn-primary text-sm py-2 px-4 shrink-0">
                  Upgrade ↗
                </Link>
              </div>
            )}

            {/* I miei annunci */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-dark">I miei annunci</h2>
                {annunciAttivi < limiteAnnunci && (
                  <Link href="/crea-annuncio" className="btn-primary text-sm py-2 px-4">
                    <Plus size={16} />
                    Nuovo annuncio
                  </Link>
                )}
              </div>

              {!annunci || annunci.length === 0 ? (
                <div className="card p-12 text-center">
                  <p className="text-4xl mb-4">📋</p>
                  <h3 className="text-lg font-semibold mb-2">Nessun annuncio ancora</h3>
                  <p className="text-mid mb-6">Pubblica il tuo primo annuncio gratuitamente</p>
                  <Link href="/crea-annuncio" className="btn-primary">Pubblica annuncio</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {annunci.map(a => <AnnuncioCard key={a.id} annuncio={a as any} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
