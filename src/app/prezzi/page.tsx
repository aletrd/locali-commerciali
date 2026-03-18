'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'
import { PIANI_INFO, IBAN_DATI, generaCausale } from '@/lib/utils'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type Metodo = 'stripe' | 'paypal' | 'bonifico'
export const dynamic = 'force-dynamic'
export default function PrezziPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [metodo, setMetodo] = useState<Metodo>('stripe')
  const [showBonifico, setShowBonifico] = useState<{ piano: string; importo: number; causale: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function scegli(pianoId: string, prezzo: number, priceId: string | undefined) {
    if (prezzo === 0) { router.push('/registrati'); return }
    if (!priceId) { toast.error('Piano non disponibile'); return }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login?redirect=/prezzi'); return }

    setLoading(pianoId)
    try {
      if (metodo === 'stripe') {
        const res = await fetch('/api/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ piano: pianoId, userId: user.id, priceId }),
        })
        const { url } = await res.json()
        window.location.href = url

      } else if (metodo === 'paypal') {
        const res = await fetch('/api/paypal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ importo: prezzo.toFixed(2), piano: pianoId }),
        })
        const { approval_url } = await res.json()
        window.open(approval_url, '_blank')
        toast('Completa il pagamento su PayPal, poi torna qui', { icon: '🔵' })

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

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl font-semibold text-dark mb-4">
            Piani e prezzi
          </h1>
          <p className="text-mid text-lg max-w-2xl mx-auto">
            Per privati e agenzie. Inizia gratis, nessuna carta richiesta.
          </p>
        </div>

        {/* Metodo pagamento */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <p className="text-sm font-semibold text-mid">Paga con:</p>
          {([
            { id: 'stripe', label: '💳 Carta', },
            { id: 'paypal', label: '🅿️ PayPal' },
            { id: 'bonifico', label: '🏦 Bonifico' },
          ] as { id: Metodo; label: string }[]).map(m => (
            <button key={m.id} onClick={() => setMetodo(m.id)}
              className={cn('px-4 py-2 rounded-xl text-sm font-semibold border transition-colors',
                metodo === m.id
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'bg-white border-gray-200 text-dark hover:border-primary-300')}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Griglia piani */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {PIANI_INFO.map(piano => (
            <div key={piano.id}
              className={cn('rounded-2xl p-7 flex flex-col relative',
                piano.evidenziato
                  ? 'bg-primary-600 text-white shadow-hero'
                  : 'bg-white border border-gray-100 shadow-card')}>

              {piano.evidenziato && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent-500 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                  ⭐ Più popolare
                </div>
              )}

              {/* Badge tipo */}
              <span className={cn('text-xs font-bold uppercase tracking-wider mb-3',
                piano.evidenziato ? 'text-white/60' : 'text-primary-600')}>
                {piano.id === 'agenzia' ? '🏢 Agenzie' : '👤 Privati'}
              </span>

              <h2 className={cn('text-2xl font-bold mb-1',
                piano.evidenziato ? 'text-white' : 'text-dark')}>
                {piano.nome}
              </h2>
              <p className={cn('text-sm mb-5',
                piano.evidenziato ? 'text-white/70' : 'text-mid')}>
                {piano.descrizione}
              </p>

              {/* Prezzo */}
              <div className="mb-6">
                <span className={cn('text-4xl font-extrabold',
                  piano.evidenziato ? 'text-white' : 'text-primary-600')}>
                  {piano.prezzo === 0 ? 'Gratis' : `€${piano.prezzo}`}
                </span>
                {piano.prezzo > 0 && (
                  <span className={cn('text-sm ml-1',
                    piano.evidenziato ? 'text-white/60' : 'text-mid')}>/mese</span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 flex-1 mb-7">
                {piano.features.map(f => (
                  <li key={f} className={cn('flex items-start gap-2.5 text-sm',
                    piano.evidenziato ? 'text-white/90' : 'text-dark-mid')}>
                    <Check size={15} className={cn('shrink-0 mt-0.5',
                      piano.evidenziato ? 'text-accent-400' : 'text-primary-600')} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => scegli(piano.id, piano.prezzo, piano.stripePriceId)}
                disabled={loading === piano.id}
                className={cn('w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
                  piano.evidenziato
                    ? 'bg-accent-500 hover:bg-accent-600 text-white disabled:opacity-50'
                    : 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white disabled:opacity-50')}>
                {loading === piano.id
                  ? <><Loader2 size={16} className="animate-spin" /> Attendi...</>
                  : piano.prezzo === 0
                    ? 'Inizia gratis'
                    : metodo === 'bonifico'
                      ? `Bonifico — €${piano.prezzo}/mese`
                      : `Scegli ${piano.nome}`}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ commissioni piano gratuito */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 mb-12">
          <h3 className="font-semibold text-dark text-lg mb-4">
            💡 Come funziona il piano Gratuito?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="font-semibold text-sm text-dark mb-1">📄 Su vendita</p>
              <p className="text-sm text-mid">1.5% del prezzo di vendita, pagato solo a affare concluso tramite la piattaforma.</p>
            </div>
            <div>
              <p className="font-semibold text-sm text-dark mb-1">🔑 Su affitto</p>
              <p className="text-sm text-mid">1 mensilità di canone come commissione, pagata solo alla firma del contratto.</p>
            </div>
          </div>
        </div>

        {/* Modal istruzioni bonifico */}
        {showBonifico && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-8">
              <h3 className="text-xl font-bold text-dark mb-2">🏦 Istruzioni bonifico</h3>
              <p className="text-sm text-mid mb-6">
                Effettua il bonifico con i seguenti dati. Attivazione entro 24-48 ore.
              </p>
              <div className="bg-primary-50 rounded-xl p-5 space-y-3 mb-6">
                {[
                  ['Intestatario', IBAN_DATI.intestatario],
                  ['IBAN', IBAN_DATI.iban],
                  ['BIC', IBAN_DATI.bic],
                  ['Importo', `€${showBonifico.importo}/mese`],
                  ['Causale', showBonifico.causale],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-mid">{k}</span>
                    <span className={cn('font-semibold', k === 'Causale' ? 'text-primary-600' : 'text-dark')}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
                ⚠️ Copia esattamente la causale per permetterci di identificare il pagamento.
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `IBAN: ${IBAN_DATI.iban}\nCausale: ${showBonifico.causale}\nImporto: €${showBonifico.importo}/mese`
                    )
                    toast.success('Dati copiati!')
                  }}
                  className="btn-outline flex-1 justify-center">
                  📋 Copia dati
                </button>
                <button onClick={() => setShowBonifico(null)} className="btn-primary flex-1 justify-center">
                  Ho capito
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </>
  )
}
