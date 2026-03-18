# LocaliCommerciali.it — Next.js + Vercel

Progetto completo pronto per il deploy su Vercel.
Stack: **Next.js 14** · **Supabase** · **Stripe** · **PayPal** · **Resend**

---

## Struttura progetto

```
locali-commerciali/
├── src/
│   ├── app/
│   │   ├── page.tsx                  Homepage con SSR
│   │   ├── annunci/page.tsx          Lista annunci con filtri
│   │   ├── annunci/[id]/page.tsx     Dettaglio annuncio
│   │   ├── blog/page.tsx             Blog
│   │   ├── blog/[slug]/page.tsx      Articolo blog
│   │   ├── citta/[citta]/page.tsx    Pagine SEO per città
│   │   ├── prezzi/page.tsx           Piani + checkout
│   │   ├── dashboard/page.tsx        Area utente
│   │   ├── admin/page.tsx            Pannello admin
│   │   ├── login/page.tsx            Login
│   │   ├── registrati/page.tsx       Registrazione
│   │   ├── mappa/page.tsx            Mappa annunci
│   │   ├── auth/callback/route.ts    OAuth callback
│   │   └── api/
│   │       ├── stripe/route.ts       Checkout Stripe
│   │       ├── webhook/route.ts      Webhook Stripe
│   │       ├── paypal/route.ts       Ordini PayPal
│   │       ├── bonifico/route.ts     Bonifico + email
│   │       └── sitemap/route.ts      sitemap.xml dinamica
│   ├── components/
│   │   ├── layout/Navbar.tsx
│   │   ├── layout/Footer.tsx
│   │   └── annunci/AnnuncioCard.tsx
│   ├── lib/
│   │   ├── supabase.ts               Client browser + server
│   │   └── utils.ts                  Utility functions
│   └── types/index.ts                Tutti i tipi TypeScript
├── supabase/migrations/
│   └── 001_schema_completo.sql       Database completo
├── public/
│   ├── robots.txt
│   └── manifest.json
├── vercel.json
├── .env.local.example
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## Setup in 10 passi

### 1. Clona e installa
```bash
npm install
```

### 2. Configura variabili d'ambiente
```bash
cp .env.local.example .env.local
# Apri .env.local e compila con i tuoi valori reali
```

### 3. Crea database Supabase
1. Vai su supabase.com → nuovo progetto
2. SQL Editor → incolla `supabase/migrations/001_schema_completo.sql` → Run
3. Copia URL e chiavi in `.env.local`

### 4. Avvia in locale
```bash
npm run dev
# → http://localhost:3000
```

### 5. Imposta te stesso come admin
Nel SQL Editor di Supabase:
```sql
update public.profiles set role = 'admin' where email = 'tua@email.it';
```
Poi accedi all'app: vedrai il link **Admin** nel menu.

### 6. Configura Stripe
1. dashboard.stripe.com → crea prodotti (Base €19, Pro €49, Agenzia €99)
2. Copia i Price ID in `.env.local`
3. In locale: `stripe listen --forward-to localhost:3000/api/webhook`
4. Copia il webhook secret in `.env.local`

### 7. Configura PayPal
1. developer.paypal.com → crea app sandbox
2. Copia Client ID e Secret in `.env.local`

### 8. Configura Resend (email)
1. resend.com → crea account → aggiungi dominio
2. Copia API key in `.env.local`

### 9. Aggiorna coordinate bancarie
In `src/lib/utils.ts`:
```typescript
export const IBAN_DATI = {
  intestatario: 'La Tua Società S.r.l.',
  iban: 'IT00 XXXX XXXX XXXX XXXX XXXX XXX',
  bic: 'TUABICX',
  banca: 'La tua banca',
}
```
E in `.env.local`:
```
NEXT_PUBLIC_IBAN=IT00 XXXX...
NEXT_PUBLIC_BIC=TUABICX
NEXT_PUBLIC_BANCA=La tua banca
```

### 10. Deploy su Vercel
```bash
# Installa Vercel CLI
npm i -g vercel

# Deploy
vercel

# Aggiungi le variabili d'ambiente su Vercel Dashboard
# oppure usa:
vercel env add NOME_VARIABILE
```

**Oppure** collega il repository GitHub a Vercel e ogni push su `main`
farà il deploy automaticamente.

---

## Funzionalità incluse

| Feature | Stato |
|---------|-------|
| Homepage con SSR | ✅ |
| Lista annunci con filtri | ✅ |
| Mappa interattiva | ✅ |
| Blog con SEO | ✅ |
| Pagine città (SEO locale) | ✅ |
| Login / Registrazione | ✅ |
| Login Google (OAuth) | ✅ |
| Dashboard utente | ✅ |
| Pannello Admin | ✅ |
| Pagamento Stripe (carta) | ✅ |
| Pagamento PayPal | ✅ |
| Bonifico bancario | ✅ |
| Email automatiche (Resend) | ✅ |
| sitemap.xml dinamica | ✅ |
| robots.txt | ✅ |
| Schema.org (SEO) | ✅ |
| PWA (installabile) | ✅ |

---

## Costi mensili stimati (produzione)

| Servizio | Piano | Costo |
|----------|-------|-------|
| Vercel | Pro | €20/mese |
| Supabase | Pro | €25/mese |
| Resend | Gratuito fino a 3k email | €0 |
| Stripe | % sulle transazioni | 1.5%+€0.25 |
| PayPal | % sulle transazioni | ~3.4% |
| Dominio .it | — | ~€10/anno |
| **Totale fisso** | | **~€45/mese** |



