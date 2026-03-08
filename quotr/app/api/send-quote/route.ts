import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

function generateSlug() {
  return Math.random().toString(36).substring(2, 8)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Request body:', body)

    const { customer_name, customer_phone, amount, trade, description, expiry_days, contractor_id } = body

    const slug = generateSlug()

    const { data: quote, error } = await supabaseServer
      .from('quotes')
      .insert({
        contractor_id,
        customer_name,
        customer_phone,
        amount,
        trade,
        description,
        expiry_days,
        slug,
        status: 'sent'
      })
      .select()
      .single()

    if (error) {
      console.log('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const quoteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/q/${slug}`
    const lowestMonthly = Math.round(amount / 12)
    const message = `Hi ${customer_name} 👋 Your quote is ready.\n\nTotal: $${amount.toLocaleString()}\nOr as low as $${lowestMonthly}/mo\n\nTap to view: ${quoteUrl}`

    console.log('SMS would send to:', customer_phone)
    console.log('Message:', message)

    return NextResponse.json({ success: true, slug, quote })
  } catch (err) {
    console.log('Caught error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
