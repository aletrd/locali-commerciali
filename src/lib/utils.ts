// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { CategoriaLocale, CATEGORIE_INFO } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrezzo(prezzo: number, tipo: 'vendita' | 'affitto'): string {
  const fmt = new Intl.NumberFormat('it-IT', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(prezzo)
  return tipo === 'affitto' ? `${fmt}/mese` : fmt
}

export function formatData(dateStr: string): string {
  const mesi = ['', 'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio',
    'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
  const d = new Date(dateStr)
  return `${d.getDate()} ${mesi[d.getMonth() + 1]} ${d.getFullYear()}`
}

export function formatDataBreve(dateStr: string): string {
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
}

export function tempoLettura(contenuto: string): number {
  return Math.ceil(contenuto.split(' ').length / 200)
}

export function generaSlug(titolo: string): string {
  return titolo.toLowerCase()
    .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u').replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

export function getCategoriaInfo(cat: CategoriaLocale) {
  return CATEGORIE_INFO[cat] ?? { label: cat, emoji: '🏢' }
}

export function distanzaKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export const IBAN_DATI = {
  intestatario: 'LocaliCommerciali.it S.r.l.',
  iban: process.env.NEXT_PUBLIC_IBAN ?? 'IT60 X054 2811 1010 0000 0123 456',
  bic: process.env.NEXT_PUBLIC_BIC ?? 'BLOPIT22',
  banca: process.env.NEXT_PUBLIC_BANCA ?? 'Banco BPM',
}

export function generaCausale(piano: string, userId: string): string {
  return `Abbonamento Piano ${piano.toUpperCase()} - ${userId.substring(0, 8).toUpperCase()}`
}
