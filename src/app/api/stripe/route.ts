import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

// POST /api/stripe/checkout — crea sessione checkout
export async function POST(req: NextRequest) {
  const { piano, userId, priceId } = await req.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?pagamento=ok&piano=${piano}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/prezzi`,
    metadata: { user_id: userId, piano },
    locale: 'it',
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    payment_method_options: {
      card: { request_three_d_secure: 'automatic' },
    },
  })

  return NextResponse.json({ url: session.url })
}
