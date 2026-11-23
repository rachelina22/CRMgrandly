import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Users, TrendingUp, Star, Zap, Plus, ArrowRight } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

function KPICard({ label, value, sub, shadow = '#BBD3F5', bg = '#BBD3F5', icon: Icon }) {
  return (
    <div
      className="bg-paper rounded-card p-5 flex gap-4 items-start"
      style={{ border: '2px solid #101F5C', boxShadow: `6px 6px 0 ${shadow}` }}
    >
      <div
        className="rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: bg }}
      >
        <Icon size={18} color="#101F5C" />
      </div>
      <div className="min-w-0">
        <div className="eyebrow" style={{ fontSize: '.68rem', marginBottom: 2 }}>{label}</div>
        <div className="font-display text-navy leading-none mb-1" style={{ fontSize: '2rem' }}>
          {value ?? '—'}
        </div>
        {sub && <div className="font-body text-grey text-xs">{sub}</div>}
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="bg-paper rounded-card px-3 py-2"
      style={{ border: '2px solid #101F5C' }}
    >
      <p className="font-ui font-bold text-navy text-xs mb-0.5">{label}</p>
      <p className="font-body text-blue text-sm font-semibold">
        {payload[0].value} nuevos
      </p>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats]   = useState(null)
  const [growth, setGrowth] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [{ data: s, error: e1 }, { data: g, error: e2 }] = await Promise.all([
          supabase.from('customer_stats_view').select('*').single(),
          supabase.rpc('monthly_growth', { months_back: 6 }),
        ])
        if (e1) throw e1
        if (e2) throw e2
        setStats(s)
        setGrowth(g ?? [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div className="pt-24 text-center">
      <span className="font-ui font-semibold text-sm tracking-widest uppercase text-grey">
        Cargando datos reales…
      </span>
    </div>
  )

  if (error) return (
    <div
      className="rounded-card p-4 font-ui font-semibold text-sm"
      style={{ background: '#FCE3DF', color: '#7A1A10', border: '1.5px solid #B3261A' }}
    >
      Error al conectar con Supabase: {error}
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="eyebrow">Panel principal</div>
        <h1 className="font-display text-navy mb-2" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', lineHeight: 1.05 }}>
          Buenos días, GRANDLY
        </h1>
        <p className="font-body text-grey">
          Datos en tiempo real desde tu base de datos en Supabase.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))' }}>
        <KPICard label="Total clientes" value={stats?.total ?? 0}          sub="en base de datos"   shadow="#BBD3F5" bg="#BBD3F5" icon={Users}     />
        <KPICard label="Nuevos este mes" value={stats?.new_this_month ?? 0} sub="alta en 30 días"    shadow="#F7C531" bg="#F7C531" icon={TrendingUp} />
        <KPICard label="Premium"          value={stats?.premium ?? 0}       sub="plan premium"       shadow="#F4B9C2" bg="#F4B9C2" icon={Star}       />
        <KPICard label="VIP"              value={stats?.vip ?? 0}           sub="plan VIP"           shadow="#D4EDE9" bg="#D4EDE9" icon={Zap}        />
      </div>

      {/* Gráfico crecimiento */}
      <div
        className="bg-paper rounded-card p-6 mb-6"
        style={{ border: '2px solid #101F5C' }}
      >
        <div className="eyebrow" style={{ fontSize: '.72rem' }}>Evolución</div>
        <h2 className="font-display text-navy mb-5" style={{ fontSize: '1.5rem' }}>
          Nuevos clientes por mes
        </h2>
        {growth.some(d => d.new_customers > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={growth} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D9D2BF" />
              <XAxis
                dataKey="month"
                tick={{ fontFamily: 'Jost', fontSize: 11, fill: '#4A5272' }}
              />
              <YAxis
                tick={{ fontFamily: 'Jost', fontSize: 11, fill: '#4A5272' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="new_customers"
                stroke="#1D3FAE"
                strokeWidth={2.5}
                dot={{ fill: '#1D3FAE', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#F7C531', stroke: '#101F5C', strokeWidth: 2 }}
                name="Nuevos clientes"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="py-10 text-center font-body text-grey text-sm">
            Cuando añadas los primeros clientes el gráfico se actualizará solo.
          </div>
        )}
      </div>

      {/* Accesos rápidos */}
      <div className="flex gap-3 flex-wrap">
        <Link to="/clientes/nuevo" className="btn btn-p">
          <Plus size={15} />
          Nuevo cliente
        </Link>
        <Link to="/clientes" className="btn">
          Ver clientes
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}
