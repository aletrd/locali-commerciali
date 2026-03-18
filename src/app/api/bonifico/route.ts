import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { IBAN_DATI, generaCausale } from '@/lib/utils'

// POST /api/bonifico — registra richiesta bonifico e invia email
export async function POST(req: NextRequest) {
  const { user_id, piano, importo } = await req.json()
  const supabase = createAdminClient()

  const { data: profilo } = await supabase
    .from('profiles').select('email, full_name').eq('id', user_id).single()

  if (!profilo) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const causale = generaCausale(piano, user_id)

  // Salva pagamento in attesa
  await supabase.from('pagamenti').insert({
    user_id, importo, valuta: 'EUR',
    metodo: 'bonifico', stato: 'in_attesa',
    piano, riferimento_bonifico: causale,
  })

  // Email istruzioni all'utente via Resend
  const nome = profilo.full_name?.split(' ')[0] ?? ''
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'LocaliCommerciali.it <noreply@localicommerciali.it>',
      to: profilo.email,
      subject: `Istruzioni bonifico Piano ${piano} — LocaliCommerciali.it`,
      html: `
        <div style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:40px;">
          <h2 style="color:#0A5C44;">Istruzioni per il bonifico</h2>
          <p>Ciao ${nome ? `<strong>${nome}</strong>` : ''}!</p>
          <p>Effettua il bonifico con i seguenti dati per attivare il <strong>Piano ${piano}</strong>:</p>
          <div style="background:#F0F7F4;padding:20px;border-radius:12px;margin:20px 0;">
            <p><strong>Intestatario:</strong> ${IBAN_DATI.intestatario}</p>
            <p><strong>IBAN:</strong> ${IBAN_DATI.iban}</p>
            <p><strong>BIC:</strong> ${IBAN_DATI.bic}</p>
            <p><strong>Importo:</strong> €${importo}/mese</p>
            <p><strong>Causale:</strong> <span style="color:#0A5C44;font-weight:700;">${causale}</span></p>
          </div>
          <p style="color:#C49A2A;">⚠️ Inserisci la causale esatta per identificare il pagamento.</p>
          <p>Attivazione entro 24-48 ore lavorative dal ricevimento.</p>
        </div>
      `,
    }),
  })

  // Notifica admin
  const emailAdmin = process.env.EMAIL_ADMIN ?? 'info@localicommerciali.it'
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'LocaliCommerciali.it <noreply@localicommerciali.it>',
      to: emailAdmin,
      subject: `[Admin] Nuovo ordine bonifico — Piano ${piano}`,
      html: `<p>Utente: ${profilo.email}<br>Piano: ${piano}<br>Importo: €${importo}/mese<br>Causale: ${causale}</p>`,
    }),
  })

  return NextResponse.json({ success: true, causale, iban: IBAN_DATI })
}
