'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const fmt = (v: number) => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', maximumFractionDigits:0 }).format(v)

const statusColor: Record<string, string> = {
  sent:    '#f59e0b',
  viewed:  '#3b82f6',
  applied: '#22c55e',
  expired: '#6b7280',
}

const statusBg: Record<string, string> = {
  sent:    'rgba(245,158,11,0.1)',
  viewed:  'rgba(59,130,246,0.1)',
  applied: 'rgba(34,197,94,0.1)',
  expired: 'rgba(107,114,128,0.1)',
}

export default function DashboardClient({ quotes: initial, user: initialUser }: { quotes: any[], user: any }) {
  const router  = useRouter()
  const [user,   setUser]   = useState<any>(null)
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)

      const { data: q } = await supabase
        .from('quotes')
        .select('*')
        .eq('contractor_id', data.user.id)
        .order('created_at', { ascending: false })

      setQuotes(q || [])
      setLoading(false)
    })
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const totalSent    = quotes.length
  const totalViewed  = quotes.filter(q => q.status === 'viewed' || q.status === 'applied').length
  const totalApplied = quotes.filter(q => q.status === 'applied').length
  const totalValue   = quotes.reduce((sum, q) => sum + Number(q.amount), 0)

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', color:'#f59e0b', fontSize:'16px', fontFamily:'sans-serif' }}>
      Loading...
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#0f172a', color:'#f1f5f9', fontFamily:"'Familjen Grotesk',sans-serif", paddingBottom:'48px' }}>

      {/* Header */}
      <div style={{ padding:'24px 20px 20px', borderBottom:'1px solid #1e293b', display:'flex', justifyContent:'space-between', alignItems:'center', maxWidth:'480px', margin:'0 auto' }}>
        <div>
          <div style={{ fontSize:'26px', color:'#f59e0b', fontWeight:700 }}>Quotr</div>
          <div style={{ fontSize:'11px', color:'#475569', letterSpacing:'1.5px', marginTop:'2px' }}>DASHBOARD</div>
        </div>
        <button onClick={signOut} style={{ background:'transparent', border:'1px solid #334155', borderRadius:'8px', padding:'8px 16px', color:'#94a3b8', fontSize:'13px', cursor:'pointer', fontFamily:"'Familjen Grotesk',sans-serif" }}>
          Sign out
        </button>
      </div>

      <div style={{ maxWidth:'480px', margin:'0 auto', padding:'24px 20px 0' }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'24px' }}>
          {[
            { label:'Quotes sent',  value: totalSent,      color:'#f59e0b' },
            { label:'Opened',       value: totalViewed,    color:'#3b82f6' },
            { label:'Applied',      value: totalApplied,   color:'#22c55e' },
            { label:'Total quoted', value: fmt(totalValue),color:'#a78bfa' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background:'#1e293b', borderRadius:'14px', padding:'16px', border:'1px solid #334155' }}>
              <div style={{ fontSize:'11px', color:'#64748b', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px' }}>{label}</div>
              <div style={{ fontSize:'26px', fontWeight:700, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Send quote button */}
        <button onClick={() => router.push('/')} style={{ width:'100%', background:'#f59e0b', color:'#111', border:'none', borderRadius:'14px', padding:'18px', fontSize:'16px', fontWeight:700, cursor:'pointer', fontFamily:"'Familjen Grotesk',sans-serif", marginBottom:'24px', boxShadow:'0 4px 20px rgba(245,158,11,0.3)' }}>
          📱 Send a new quote
        </button>

        {/* Quotes list */}
        <div style={{ fontSize:'11px', color:'#475569', letterSpacing:'1px', fontWeight:700, marginBottom:'12px' }}>RECENT QUOTES</div>

        {quotes.length === 0 && (
          <div style={{ textAlign:'center', color:'#475569', padding:'40px 20px', background:'#1e293b', borderRadius:'16px', border:'1px solid #334155' }}>
            No quotes sent yet. Hit the button above to send your first one.
          </div>
        )}

        {quotes.map(q => (
          <div key={q.id} style={{ background:'#1e293b', borderRadius:'14px', padding:'16px 18px', marginBottom:'10px', border:'1px solid #334155' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
              <div>
                <div style={{ fontSize:'16px', fontWeight:700, color:'#f1f5f9' }}>{q.customer_name}</div>
                <div style={{ fontSize:'13px', color:'#64748b', marginTop:'2px' }}>{q.customer_phone}</div>
              </div>
              <div style={{ fontSize:'20px', fontWeight:700, color:'#f59e0b' }}>{fmt(q.amount)}</div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                {q.trade && (
                  <span style={{ padding:'3px 10px', borderRadius:'100px', background:'rgba(255,255,255,0.05)', fontSize:'11px', color:'#94a3b8', fontWeight:600 }}>
                    {q.trade}
                  </span>
                )}
                <span style={{ padding:'3px 10px', borderRadius:'100px', background: statusBg[q.status] || statusBg.sent, fontSize:'11px', color: statusColor[q.status] || statusColor.sent, fontWeight:700 }}>
                  {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                </span>
              </div>
              <div style={{ fontSize:'11px', color:'#475569' }}>
                {new Date(q.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}
