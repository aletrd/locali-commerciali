import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Maximize2, Star } from 'lucide-react'
import { formatPrezzo, getCategoriaInfo, cn } from '@/lib/utils'
import type { Annuncio } from '@/types'

interface Props {
  annuncio: Annuncio
  compact?: boolean
}

export default function AnnuncioCard({ annuncio: a, compact = false }: Props) {
  const cat = getCategoriaInfo(a.categoria)

  return (
    <Link href={`/annunci/${a.id}`}
      className={cn('card hover:shadow-card-hover transition-all duration-200 overflow-hidden flex flex-col group', compact && 'text-sm')}>

      {/* Immagine */}
      <div className={cn('relative bg-gray-100 overflow-hidden', compact ? 'h-36' : 'h-48')}>
        {a.foto.length > 0 ? (
          <Image
            src={a.foto[0]}
            alt={a.titolo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes={compact ? '200px' : '400px'}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-primary-50">
            <span className={cn(compact ? 'text-3xl' : 'text-5xl')}>{cat.emoji}</span>
            <span className="text-xs text-mid mt-1">{cat.label}</span>
          </div>
        )}

        {/* Badge tipo */}
        <div className={cn(
          'absolute top-2.5 left-2.5 badge text-white',
          a.tipo === 'vendita' ? 'bg-primary-600' : 'bg-emerald-600'
        )}>
          {a.tipo === 'vendita' ? 'Vendita' : 'Affitto'}
        </div>

        {/* Badge evidenza */}
        {a.in_evidenza && (
          <div className="absolute top-2.5 right-2.5 badge bg-accent-500 text-white">
            <Star size={10} fill="currentColor" />
            In evidenza
          </div>
        )}
      </div>

      {/* Info */}
      <div className={cn('flex flex-col gap-1.5', compact ? 'p-3' : 'p-4')}>
        {/* Prezzo */}
        <p className={cn('font-extrabold text-primary-600', compact ? 'text-lg' : 'text-2xl')}>
          {formatPrezzo(a.prezzo, a.tipo)}
        </p>

        {/* Titolo */}
        <h3 className={cn('font-semibold text-dark leading-snug line-clamp-2',
          compact ? 'text-sm' : 'text-base')}>
          {a.titolo}
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-3 text-mid mt-1">
          <span className="flex items-center gap-1 text-xs">
            <MapPin size={12} />
            {a.citta}
          </span>
          {a.superficie_mq && (
            <span className="flex items-center gap-1 text-xs">
              <Maximize2 size={12} />
              {a.superficie_mq} mq
            </span>
          )}
          <span className="ml-auto text-xs">{cat.emoji} {cat.label}</span>
        </div>
      </div>
    </Link>
  )
}
