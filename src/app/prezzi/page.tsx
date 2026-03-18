'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'
import { IBAN_DATI, generaCausale } from '@/lib/utils'
import toast from 'react-hot-toast'

const PIANI = [
  { id: 'gratuito', nome: 'Gratuito', prezzo: 0, features: ['1 annuncio attivo', 'Foto base (max 5)', '1.5% sulla vendita'] },
  { id: 'base', nome: 'Base', prezzo: 19, features: ['5 annunci attivi', 'Fino a 15 foto', 'Nessuna commissione', 'Statistiche base'] },
  { id: 'pro', nome: 'Pro', prezzo: 49, evidenziato: true, features: ['Annunci illimitati', 'Foto illimitate', 'Badge in evidenza', 'Statistiche avanzate'] },
  { id: 'agenzia', nome: 'Agenzia', prezzo: 99, features: ['Tutto il piano Pro', 'Profilo verificato', 'Gestione team', 'Account manager'] },
]

export default function PrezziPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [metodo, setMetodo] = useState<'stripe' | 'paypal' | 'bonifico'>('stripe')
  const [showBonifico, setShowBonifico] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  async function scegli(pianoId: string, prezzo: number) {
    if (prezzo === 0) { router.push('/registrati'); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login?redirect=/prezzi'); return }
    setLoading(pianoId)
    try {
      if (metodo === 'stripe') {
        const res = await fetch('/api/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ piano: pianoId, userId: user.id, priceId: `price_${pianoId}` }),
        })
        const { url, error } = await res.json()
        if (error) throw new Error(error)
        window.location.href = url
      } else if (metodo === 'paypal') {
        const res = await fetch('/api/paypal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ importo: prezzo.toFixed(2), piano: pianoId }),
        })
        const { approval_url } = await res.json()
        window.open(approval_url, '_blank')
        toast('Completa il pagamento su PayPal poi torna qui', { icon: '🔵' })
      } else {
        const res = await fetch('/api/bonifico', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, piano: pianoId, importo: prezzo }),
        })
        const { causale } = await res.json()
        setShowBonifico({ piano: pianoId, importo: prezzo, causale })
      }
    } catch {
      toast.error('Errore. Riprova.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-semibold text-gray-900 mb-4">Piani e prezzi</h1>
          <p className="text-gray-500 text-lg">Inizia gratis, nessuna carta richiesta.</p>
        </div>
        <div className="flex items-center justify-center gap-3 mb-10">
          <p className="text-sm font-semibold text-gray-500">Paga con:</p>
          {[{ id: 'stripe', label: '💳 Carta' }, { id: 'paypal', label: '🅿️ PayPal' }, { id: 'bonifico', label: '🏦 Bonifico' }].map((m: any) => (
            <button key={m.id} onClick={() => setMetodo(m.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${metodo === m.id ? 'bg-green-800 border-green-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {PIANI.map(piano => (
            <div key={piano.id} className={`rounded-2xl p-7 flex flex-col relative ${(piano as any).evidenziato ? 'bg-green-800 text-white shadow-xl' : 'bg-white border border-gray-100 shadow-sm'}`}>
              {(piano as any).evidenziato && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-4 py-1.5 rounded-full">⭐ Più popolare</div>}
              <h2 className={`text-2xl font-bold mb-1 ${(piano as any).evidenziato ? 'text-white' : 'text-gray-900'}`}>{piano.nome}</h2>
              <div className={`text-4xl font-extrabold mb-6 ${(piano as any).evidenziato ? 'text-white' : 'text-green-800'}`}>
                {piano.prezzo === 0 ? 'Gratis' : `€${piano.prezzo}`}
                {piano.prezzo > 0 && <span className={`text-sm font-normal ${(piano as any).evidenziato ? 'text-white/60' : 'text-gray-400'}`}>/mese</span>}
              </div>
              <ul className="space-y-3 flex-1 mb-7">
                {piano.features.map(f => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${(piano as any).evidenziato ? 'text-white/90' : 'text-gray-600'}`}>
                    <span className="text-yellow-500">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => scegli(piano.id, piano.prezzo)} disabled={loading === piano.id}
                className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${(piano as any).evidenziato ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'border-2 border-green-800 text-green-800 hover:bg-green-800 hover:text-white'}`}>
                {loading === piano.id ? <Loader2 size={16} className="animate-spin" /> : piano.prezzo === 0 ? 'Inizia gratis' : `Scegli ${piano.nome}`}
              </button>
            </div>
          ))}
        </div>
        {showBonifico && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">🏦 Istruzioni bonifico</h3>
              <div className="bg-green-50 rounded-xl p-5 space-y-3 mb-6">
                {[['Intestatario', IBAN_DATI.intestatario], ['IBAN', IBAN_DATI.iban], ['BIC', IBAN_DATI.bic], ['Importo', `€${showBonifico.importo}/mese`], ['Causale', showBonifico.causale]].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-semibold text-gray-900">{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => { navigator.clipboard.writeText(`IBAN: ${IBAN_DATI.iban}\nCausale: ${showBonifico.causale}`); toast.success('Copiato!') }}
                  className="flex-1 border-2 border-green-800 text-green-800 py-3 rounded-xl font-semibold text-sm">📋 Copia</button>
                <button onClick={() => setShowBonifico(null)} className="flex-1 bg-green-800 text-white py-3 rounded-xl font-semibold text-sm">Ho capito</button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
