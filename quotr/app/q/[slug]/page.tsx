import { supabaseServer } from '@/lib/supabase-server'
import CustomerPage from '@/components/CustomerPage'
import { notFound } from 'next/navigation'

export default async function QuotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: quote, error } = await supabaseServer
    .from('quotes')
    .select(`
      *,
      contractors (
        business_name,
        email
      )
    `)
    .eq('slug', slug)
    .single()

  if (error || !quote) return notFound()

  await supabaseServer
    .from('quotes')
    .update({ status: 'viewed', viewed_at: new Date().toISOString() })
    .eq('slug', slug)

  return <CustomerPage quote={quote} />
}
