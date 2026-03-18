import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

const PAYPAL_BASE = process.env.PAYPAL_ENV === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

async function getAccessToken(): Promise<string> {
  const creds = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString('base64')
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token
}

// POST /api/paypal — crea ordine
export async function POST(req: NextRequest) {
  const { importo, piano, descrizione } = await req.json()
  const token = await getAccessToken()

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: 'EUR', value: importo },
        description: descrizione ?? `Piano ${piano} — LocaliCommerciali.it`,
        custom_id: piano,
      }],
      application_context: {
        brand_name: 'LocaliCommerciali.it',
        locale: 'it-IT',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?pagamento=ok`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/prezzi`,
      },
    }),
  })

  const order = await res.json()
  const approvalUrl = order.links?.find((l: any) => l.rel === 'approve')?.href
  return NextResponse.json({ order_id: order.id, approval_url: approvalUrl })
}

// PUT /api/paypal — cattura ordine
export async function PUT(req: NextRequest) {
  const { order_id, piano, user_id } = await req.json()
  const token = await getAccessToken()

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${order_id}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })

  const capture = await res.json()

  if (capture.status === 'COMPLETED') {
    const supabase = createAdminClient()
    await supabase.from('profiles').update({ piano }).eq('id', user_id)
    await supabase.from('abbonamenti').insert({
      user_id, piano, stato: 'attivo',
      prossimo_rinnovo: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
    })
    await supabase.from('pagamenti').insert({
      user_id, importo: parseFloat(
        capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ?? '0'
      ),
      valuta: 'EUR', metodo: 'paypal', stato: 'completato',
      piano, paypal_order_id: order_id,
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false }, { status: 400 })
}
