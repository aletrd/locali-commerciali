'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

type Ruolo = 'privato' | 'agenzia'

export default function RegistratiPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nomeAgenzia, setNomeAgenzia] = useState('')
  const [ruolo, setRuolo] = useState<Ruolo>('privato')
  const [loading, setLoading] = useState(false)
  const [successo, setSuccesso] = useState(false)
  const supabase = createClient()

  async function registrati(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password minimo 8 caratteri'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: nome,
          role: ruolo,
          nome_agenzia: ruolo === 'agenzia' ? nomeAgenzia : null,
        },
      },
    })
    if (error) toast.error(error.message.includes('already registered') ? 'Email già registrata' : error.message)
    else setSuccesso(true)
    setLoading(false)
  }

  if (successo) return (
    <div className="min-h-screen bg-ultra-light flex items-center justify-center p-4">
      <div className="card p-12 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-green-600" />
        </div>
        <h2 className="font-display text-3xl font-semibold text-dark mb-3">Account creato!</h2>
        <p className="text-mid mb-6">
          Controlla la tua email e clicca il link di conferma per attivare l'account.
        </p>
        <Link href="/login" className="btn-primary w-full justify-center">Vai al login</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-ultra-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1 mb-6">
            <span className="text-2xl font-bold text-primary-600">Locali</span>
            <span className="text-2xl font-bold text-accent-500">Commerciali</span>
            <span className="text-2xl text-mid">.it</span>
          </Link>
          <h1 className="font-display text-3xl font-semibold text-dark">Crea account</h1>
          <p className="text-mid mt-2">Inizia a pubblicare oggi, gratis</p>
        </div>

        <div className="card p-8">
          {/* Selezione ruolo */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(['privato', 'agenzia'] as Ruolo[]).map(r => (
              <button key={r} type="button" onClick={() => setRuolo(r)}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                  ruolo === r
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-dark hover:border-gray-300'}`}>
                {r === 'privato' ? '👤 Privato' : '🏢 Agenzia'}
              </button>
            ))}
          </div>

          <form onSubmit={registrati} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Nome e cognome</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)}
                className="input" placeholder="Mario Rossi" required />
            </div>
            {ruolo === 'agenzia' && (
              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Nome agenzia</label>
                <input type="text" value={nomeAgenzia} onChange={e => setNomeAgenzia(e.target.value)}
                  className="input" placeholder="Immobiliare Rossi" required />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="tua@email.it" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Password (min. 8 caratteri)</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="input" placeholder="••••••••" required minLength={8} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Crea account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-mid mt-6">
          Hai già un account?{' '}
          <Link href="/login" className="text-primary-600 font-semibold hover:underline">Accedi</Link>
        </p>
      </div>
    </div>
  )
}
