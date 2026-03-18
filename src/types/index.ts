// src/types/index.ts — Tutti i tipi del progetto

export type Ruolo = 'privato' | 'agenzia' | 'admin'
export type Piano = 'gratuito' | 'base' | 'pro' | 'agenzia'
export type TipoAnnuncio = 'vendita' | 'affitto'
export type CategoriaLocale = 'ufficio' | 'negozio' | 'bar' | 'ristorante' | 'magazzino' | 'capannone' | 'altro'
export type StatoPagamento = 'in_attesa' | 'completato' | 'fallito' | 'rimborsato'
export type MetodoPagamento = 'stripe' | 'paypal' | 'googlePay' | 'applePay' | 'bonifico'

export interface Profilo {
  id: string
  email: string
  full_name: string | null
  telefono: string | null
  role: Ruolo
  piano: Piano
  nome_agenzia: string | null
  logo_url: string | null
  stripe_customer_id: string | null
  annunci_attivi: number
  ragione_sociale: string | null
  piva: string | null
  codice_fiscale: string | null
  indirizzo_fatturazione: string | null
  pec: string | null
  created_at: string
}

export interface Annuncio {
  id: string
  user_id: string
  titolo: string
  descrizione: string
  tipo: TipoAnnuncio
  categoria: CategoriaLocale
  prezzo: number
  superficie_mq: number | null
  piano_edificio: string | null
  posti_auto: number
  indirizzo: string
  citta: string
  cap: string | null
  provincia: string | null
  lat: number | null
  lng: number | null
  foto: string[]
  in_evidenza: boolean
  attivo: boolean
  moderato: boolean
  visualizzazioni: number
  created_at: string
  updated_at: string
  // Join
  profiles?: Partial<Profilo>
}

export interface Commissione {
  id: string
  annuncio_id: string
  user_id: string
  importo: number
  tipo: 'vendita' | 'affitto'
  stato: 'in_attesa' | 'pagato' | 'rimborsato'
  pagata_il: string | null
  created_at: string
  annunci?: { titolo: string; citta: string }
  profiles?: { full_name: string; email: string }
}

export interface Pagamento {
  id: string
  user_id: string
  importo: number
  valuta: string
  metodo: MetodoPagamento
  stato: StatoPagamento
  piano: Piano | null
  stripe_payment_intent_id: string | null
  paypal_order_id: string | null
  riferimento_bonifico: string | null
  created_at: string
}

export interface Fattura {
  id: string
  user_id: string
  numero: string
  importo: number
  piano: string
  metodo: string
  emessa_il: string
  ragione_sociale: string | null
  piva: string | null
  indirizzo: string | null
}

export interface Chat {
  id: string
  annuncio_id: string
  proprietario_id: string
  interessato_id: string
  ultimo_messaggio: string | null
  ultima_attivita: string | null
  created_at: string
  annunci?: { titolo: string }
}

export interface ChatMessaggio {
  id: string
  chat_id: string
  mittente: string
  testo: string
  letto: boolean
  created_at: string
}

export interface Recensione {
  id: string
  annuncio_id: string
  autore_id: string
  voto: number
  commento: string | null
  created_at: string
  profiles?: { full_name: string }
}

export interface ArticoloBlog {
  id: string
  titolo: string
  slug: string
  contenuto: string
  estratto: string
  immagine_url: string | null
  autore: string | null
  tags: string[]
  pubblicato: boolean
  pubblicato_il: string | null
  created_at: string
}

export interface Sponsorizzazione {
  id: string
  annuncio_id: string
  user_id: string
  importo_giornaliero: number
  inizio_il: string
  fine_il: string
  attiva: boolean
  click: number
  impressioni: number
}

export interface FiltriRicerca {
  query?: string
  citta?: string
  tipo?: TipoAnnuncio
  categoria?: CategoriaLocale
  prezzoMin?: number
  prezzoMax?: number
  superficieMin?: number
  soloEvidenza?: boolean
  raggio?: number
  lat?: number
  lng?: number
}

export const CATEGORIE_INFO: Record<CategoriaLocale, { label: string; emoji: string }> = {
  ufficio:     { label: 'Ufficio',     emoji: '🏢' },
  negozio:     { label: 'Negozio',     emoji: '🏪' },
  bar:         { label: 'Bar',         emoji: '☕' },
  ristorante:  { label: 'Ristorante',  emoji: '🍽️' },
  magazzino:   { label: 'Magazzino',   emoji: '📦' },
  capannone:   { label: 'Capannone',   emoji: '🏭' },
  altro:       { label: 'Altro',       emoji: '🔑' },
}

export const PIANI_INFO = [
  {
    id: 'gratuito' as Piano,
    nome: 'Gratuito',
    prezzo: 0,
    descrizione: 'Per iniziare senza rischi',
    features: ['1 annuncio attivo', 'Foto base (max 5)', 'Contatto via form', '1.5% sulla vendita conclusa', '1 mensilità sull\'affitto'],
    percentualeVendita: 1.5,
    percentualeAffitto: 1.0,
    stripePriceId: null,
    evidenziato: false,
  },
  {
    id: 'base' as Piano,
    nome: 'Base',
    prezzo: 19,
    descrizione: 'Per privati seri',
    features: ['5 annunci attivi', 'Fino a 15 foto', 'Nessuna commissione', 'Statistiche base', 'Supporto email'],
    stripePriceId: process.env.STRIPE_PRICE_BASE,
    evidenziato: false,
  },
  {
    id: 'pro' as Piano,
    nome: 'Pro',
    prezzo: 49,
    descrizione: 'Massima visibilità',
    features: ['Annunci illimitati', 'Foto illimitate + video', 'Badge in evidenza', 'Posizione prioritaria', 'Statistiche avanzate', 'Supporto prioritario'],
    stripePriceId: process.env.STRIPE_PRICE_PRO,
    evidenziato: true,
  },
  {
    id: 'agenzia' as Piano,
    nome: 'Agenzia',
    prezzo: 99,
    descrizione: 'Per agenzie professionali',
    features: ['Tutto il piano Pro', 'Profilo agenzia verificato', 'CRM base integrato', 'Gestione team (5 agenti)', 'API access', 'Account manager dedicato'],
    stripePriceId: process.env.STRIPE_PRICE_AGENZIA,
    evidenziato: false,
  },
]

export const CITTA_PRINCIPALI = [
  { slug: 'milano',         nome: 'Milano' },
  { slug: 'roma',           nome: 'Roma' },
  { slug: 'napoli',         nome: 'Napoli' },
  { slug: 'torino',         nome: 'Torino' },
  { slug: 'bologna',        nome: 'Bologna' },
  { slug: 'firenze',        nome: 'Firenze' },
  { slug: 'venezia',        nome: 'Venezia' },
  { slug: 'genova',         nome: 'Genova' },
  { slug: 'palermo',        nome: 'Palermo' },
  { slug: 'bari',           nome: 'Bari' },
  { slug: 'catania',        nome: 'Catania' },
  { slug: 'verona',         nome: 'Verona' },
]
