import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const piano = session.metadata?.piano
      if (userId && piano) {
        await supabase.from('profiles').update({ piano }).eq('id', userId)
        await supabase.from('abbonamenti').upsert({
          user_id: userId, piano, stato: 'attivo',
          stripe_subscription_id: session.subscription as string,
          prossimo_rinnovo: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
        })
        await supabase.from('pagamenti').insert({
          user_id: userId, importo: (session.amount_total ?? 0) / 100,
          valuta: 'EUR', metodo: 'stripe', stato: 'completato',
          piano, stripe_payment_intent_id: session.payment_intent as string,
        })
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase.from('abbonamenti')
        .update({ stato: 'cancellato' })
        .eq('stripe_subscription_id', sub.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
