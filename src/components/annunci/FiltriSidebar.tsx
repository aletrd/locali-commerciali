'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { CATEGORIE_INFO } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  filtriCorrente: Record<string, string | undefined>
}

export default function FiltriSidebar({ filtriCorrente: f }: Props) {
  const router = useRouter()
  const [prezzoMin, setPrezzoMin] = useState(f.prezzoMin ?? '')
  const [prezzoMax, setPrezzoMax] = useState(f.prezzoMax ?? '')
  const [superficieMin, setSuperficieMin] = useState(f.superficieMin ?? '')
  const [aperto, setAperto] = useState(false)

  function buildUrl(extra: Record<string, string>) {
    const params = new URLSearchParams()
    const merged = { ...f, ...extra }
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v) })
    params.delete('page')
    return `/annunci?${params.toString()}`
  }

  function setFiltro(key: string, value: string) {
    router.push(buildUrl({ [key]: value }))
  }

  function applicaPrezzo() {
    router.push(buildUrl({ prezzoMin, prezzoMax, superficieMin }))
  }

  function rimuoviFiltro(key: string) {
    const params = new URLSearchParams(f as any)
    params.delete(key)
    params.delete('page')
    router.push(`/annunci?${params.toString()}`)
  }

  const filtriAttivi = Object.entries(f).filter(([k, v]) => v && k !== 'page')

  const content = (
    <div className="space-y-6">
      {/* Filtri attivi */}
      {filtriAttivi.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-mid uppercase tracking-wide mb-2">Filtri attivi</p>
          <div className="flex flex-wrap gap-2">
            {filtriAttivi.map(([k, v]) => (
              <button key={k} onClick={() => rimuoviFiltro(k)}
                className="flex items-center gap-1 bg-primary-50 text-primary-700 text-xs px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors">
                {v} <X size={10} />
              </button>
            ))}
          </div>
          <button onClick={() => router.push('/annunci')}
            className="text-xs text-mid hover:text-primary-600 mt-2 transition-colors">
            Rimuovi tutti i filtri
          </button>
        </div>
      )}

      {/* Tipo */}
      <div>
        <p className="text-sm font-semibold text-dark mb-3">Tipo operazione</p>
        <div className="flex gap-2">
          {['', 'vendita', 'affitto'].map(v => (
            <button key={v} onClick={() => setFiltro('tipo', v)}
              className={cn('flex-1 py-2 text-sm rounded-xl border transition-colors', 
                f.tipo === v || (!f.tipo && v === '')
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'border-gray-200 text-dark hover:border-primary-300')}>
              {v === '' ? 'Tutti' : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Categoria */}
      <div>
        <p className="text-sm font-semibold text-dark mb-3">Categoria</p>
        <div className="space-y-1.5">
          <button onClick={() => setFiltro('categoria', '')}
            className={cn('w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors',
              !f.categoria ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-dark hover:bg-gray-50')}>
            🏢 Tutte le categorie
          </button>
          {Object.entries(CATEGORIE_INFO).map(([slug, info]) => (
            <button key={slug} onClick={() => setFiltro('categoria', slug)}
              className={cn('w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors',
                f.categoria === slug ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-dark hover:bg-gray-50')}>
              {info.emoji} {info.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prezzo */}
      <div>
        <p className="text-sm font-semibold text-dark mb-3">Prezzo (€)</p>
        <div className="flex gap-2 mb-2">
          <input type="number" placeholder="Min" value={prezzoMin}
            onChange={e => setPrezzoMin(e.target.value)}
            className="input text-sm py-2" />
          <input type="number" placeholder="Max" value={prezzoMax}
            onChange={e => setPrezzoMax(e.target.value)}
            className="input text-sm py-2" />
        </div>
        <input type="number" placeholder="Superficie min (mq)" value={superficieMin}
          onChange={e => setSuperficieMin(e.target.value)}
          className="input text-sm py-2 mb-2" />
        <button onClick={applicaPrezzo}
          className="btn-primary text-sm py-2 w-full justify-center">
          Applica filtri
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block card p-5 sticky top-20">
        <div className="flex items-center gap-2 mb-5">
          <SlidersHorizontal size={16} className="text-primary-600" />
          <h2 className="font-semibold text-dark">Filtri</h2>
        </div>
        {content}
      </div>

      {/* Mobile: bottone + drawer */}
      <div className="lg:hidden">
        <button onClick={() => setAperto(true)}
          className="btn-outline text-sm py-2 px-4 flex items-center gap-2">
          <SlidersHorizontal size={16} />
          Filtri {filtriAttivi.length > 0 && `(${filtriAttivi.length})`}
        </button>
        {aperto && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40" onClick={() => setAperto(false)} />
            <div className="w-80 bg-white h-full overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-dark">Filtri</h2>
                <button onClick={() => setAperto(false)}><X size={20} /></button>
              </div>
              {content}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
