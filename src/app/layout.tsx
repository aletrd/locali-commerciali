import type { Metadata } from 'next'
import { DM_Sans, Cormorant_Garamond } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'LocaliCommerciali.it — Negozi, Uffici e Locali Commerciali in Vendita e Affitto',
    template: '%s | LocaliCommerciali.it',
  },
  description: 'Trova negozi, uffici, bar, ristoranti, magazzini e capannoni in vendita o affitto in tutta Italia. Il portale #1 per gli immobili commerciali.',
  keywords: ['locali commerciali', 'negozi in affitto', 'uffici in vendita', 'immobili commerciali', 'capannoni', 'magazzini', 'bar in vendita'],
  authors: [{ name: 'LocaliCommerciali.it' }],
  creator: 'LocaliCommerciali.it',
  metadataBase: new URL('https://www.localicommerciali.it'),
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: 'https://www.localicommerciali.it',
    siteName: 'LocaliCommerciali.it',
    title: 'LocaliCommerciali.it — Negozi, Uffici e Locali Commerciali',
    description: 'Il portale italiano per comprare, vendere e affittare locali commerciali.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LocaliCommerciali.it',
    description: 'Trova e pubblica annunci per locali commerciali in tutta Italia.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: 'https://www.localicommerciali.it',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-32.png',
    apple: '/icons/icon-192.png',
  },
  themeColor: '#0A5C44',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${dmSans.variable} ${cormorant.variable}`}>
      <body className="bg-ultra-light font-sans antialiased">
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1C1C1E',
              color: '#fff',
              borderRadius: '10px',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  )
}
