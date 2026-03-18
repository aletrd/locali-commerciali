import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { createServerClient } from '@/lib/supabase'

export default async function AdminPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/admin')

  const { data: profilo } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profilo?.role !== 'admin') redirect('/dashboard')

  // Stats
  const [
    { count: totAnnunci },
    { count: totUtenti },
    { count: abbAttivi },
    { count: daModerare },
    { data: commissioni },
  ] = await Promise.all([
    supabase.from('annunci').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('abbonamenti').select('*', { count: 'exact', head: true }).eq('stato', 'attivo'),
    supabase.from('annunci').select('*', { count: 'exact', head: true }).eq('moderato', false).eq('attivo', false),
    supabase.from('commissioni').select('importo, stato').order('created_at', { ascending: false }).limit(20),
  ])

  const totInAttesa = commissioni?.filter(c => c.stato === 'in_attesa').reduce((s, c) => s + c.importo, 0) ?? 0
  const totPagato   = commissioni?.filter(c => c.stato === 'pagato').reduce((s, c) => s + c.importo, 0) ?? 0

  const { data: utenti } = await supabase
    .from('profiles').select('email, full_name, role, piano, created_at')
    .order('created_at', { ascending: false }).limit(20)

  const { data: annunciDaModerare } = await supabase
    .from('annunci').select('id, titolo, citta, categoria, prezzo, tipo, created_at')
    .eq('moderato', false).eq('attivo', false)
    .order('created_at', { ascending: false })

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-dark">🔑 Pannello Admin</h1>
          <Link href="/admin/blog" className="btn-outline text-sm py-2 px-4">
            ✍️ Gestisci Blog
          </Link>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Annunci totali', val: totAnnunci ?? 0, color: 'text-primary-600' },
            { label: 'Utenti registrati', val: totUtenti ?? 0, color: 'text-green-600' },
            { label: 'Abbonamenti attivi', val: abbAttivi ?? 0, color: 'text-accent-500' },
            { label: 'Da moderare', val: daModerare ?? 0, color: 'text-red-500' },
          ].map(s => (
            <div key={s.label} className="card p-5 text-center">
              <p className={`text-3xl font-extrabold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-mid mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Commissioni */}
          <div className="card p-6">
            <h2 className="font-bold text-dark mb-4">💰 Commissioni</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-amber-600">€{totInAttesa.toFixed(0)}</p>
                <p className="text-xs text-mid">Da incassare</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-green-600">€{totPagato.toFixed(0)}</p>
                <p className="text-xs text-mid">Incassato</p>
              </div>
            </div>
            {commissioni?.filter(c => c.stato === 'in_attesa').length === 0 ? (
              <p className="text-sm text-mid text-center py-4">Nessuna commissione in attesa</p>
            ) : (
              <p className="text-sm text-primary-600 font-semibold">
                {commissioni?.filter(c => c.stato === 'in_attesa').length} commissioni in attesa
              </p>
            )}
          </div>

          {/* Annunci da moderare */}
          <div className="card p-6">
            <h2 className="font-bold text-dark mb-4">🔍 Annunci da moderare</h2>
            {!annunciDaModerare || annunciDaModerare.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-2xl mb-2">✅</p>
                <p className="text-sm text-mid">Nessun annuncio da moderare</p>
              </div>
            ) : (
              <div className="space-y-3">
                {annunciDaModerare.slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark truncate">{a.titolo}</p>
                      <p className="text-xs text-mid">{a.citta} · €{a.prezzo.toLocaleString('it-IT')}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <form action={async () => {
                        'use server'
                        const sb = createServerClient()
                        await sb.from('annunci').update({ moderato: true, attivo: true }).eq('id', a.id)
                      }}>
                        <button className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold">
                          ✓ Approva
                        </button>
                      </form>
                      <form action={async () => {
                        'use server'
                        const sb = createServerClient()
                        await sb.from('annunci').delete().eq('id', a.id)
                      }}>
                        <button className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-semibold">
                          ✗ Rifiuta
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ultimi utenti */}
          <div className="card p-6 lg:col-span-2">
            <h2 className="font-bold text-dark mb-4">👥 Ultimi utenti registrati</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 font-semibold text-mid">Nome</th>
                    <th className="text-left py-2 font-semibold text-mid">Email</th>
                    <th className="text-left py-2 font-semibold text-mid">Piano</th>
                    <th className="text-left py-2 font-semibold text-mid">Ruolo</th>
                    <th className="text-left py-2 font-semibold text-mid">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {utenti?.map(u => (
                    <tr key={u.email} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 font-medium text-dark">{u.full_name ?? '—'}</td>
                      <td className="py-2.5 text-mid">{u.email}</td>
                      <td className="py-2.5">
                        <span className={`badge text-xs ${
                          u.piano === 'agenzia' ? 'bg-accent-100 text-accent-700' :
                          u.piano === 'pro' ? 'bg-purple-100 text-purple-700' :
                          u.piano === 'base' ? 'bg-primary-50 text-primary-700' :
                          'bg-gray-100 text-gray-600'}`}>
                          {u.piano}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className={`badge text-xs ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 text-mid text-xs">
                        {new Date(u.created_at).toLocaleDateString('it-IT')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
