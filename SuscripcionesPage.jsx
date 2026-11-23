import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSuscripciones } from '../../hooks/useSuscripciones'
import { Search, Plus, Eye, Pencil, CreditCard } from 'lucide-react'

const STATUS_LABEL = {
  active:    'Activa',
  paused:    'Pausada',
  cancelled: 'Cancelada',
  expired:   'Expirada',
  pending:   'Pendiente',
}
const STATUS_STYLE = {
  active:    { background: '#DCEFD9', color: '#17421A', borderColor: '#17421A' },
  paused:    { background: '#FFF3CD', color: '#7A5500', borderColor: '#A07000' },
  cancelled: { background: '#FCE3DF', color: '#7A1A10', borderColor: '#7A1A10' },
  expired:   { background: '#F3F4F6', color: '#6B7280', borderColor: '#9CA3AF' },
  pending:   { background: '#BBD3F5', color: '#101F5C', borderColor: '#1D3FAE' },
}
const PLAN_LABEL = {
  mensual:     'Mensual',
  trimestral:  'Trimestral',
  semestral:   'Semestral',
  anual:       'Anual',
  regalo:      'Regalo',
}
const PLAN_STYLE = {
  mensual:    { background: '#F8F1E2', color: '#1E2747', borderColor: '#D9D2BF' },
  trimestral: { background: '#BBD3F5', color: '#101F5C', borderColor: '#1D3FAE' },
  semestral:  { background: '#D4EDE9', color: '#1A4A44', borderColor: '#1A4A44' },
  anual:      { background: '#F7C531', color: '#101F5C', borderColor: '#101F5C' },
  regalo:     { background: '#F4B9C2', color: '#7A1A3A', borderColor: '#7A1A3A' },
}
const METHOD_LABEL = {
  domiciliacion: 'Domiciliación',
  tarjeta:       'Tarjeta',
  transferencia: 'Transferencia',
  efectivo:      'Efectivo',
  otro:          'Otro',
}

export default function SuscripcionesPage() {
  const [search,    setSearch]    = useState('')
  const [status,    setStatus]    = useState('')
  const [plan_type, setPlanType]  = useState('')
  const navigate = useNavigate()

  const { suscripciones, loading, error, total } = useSuscripciones({ search, status, plan_type })

  const mrr = suscripciones
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + Number(s.price || 0), 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <div className="eyebrow">Módulo</div>
          <h1 className="font-display text-navy mb-1" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', lineHeight: 1.05 }}>
            Suscripciones
          </h1>
          {!loading && (
            <p className="font-body text-grey text-sm">
              {total} {total === 1 ? 'suscripción' : 'suscripciones'} · <span className="font-semibold text-navy">{mrr.toFixed(2)} € MRR</span>
            </p>
          )}
        </div>
        <Link to="/suscripciones/nueva" className="btn btn-p flex-shrink-0">
          <Plus size={15} /> Nueva suscripción
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-paper rounded-card p-4 mb-5 flex gap-3 flex-wrap items-center"
           style={{ border: '2px solid #101F5C' }}>
        <div className="flex items-center gap-2 flex-1"
             style={{ minWidth: 200, border: '2px solid #101F5C', borderRadius: 8, background: '#FFFDF7', paddingLeft: 12 }}>
          <Search size={14} color="#4A5272" />
          <input type="text" placeholder="Buscar por socio o plan…"
                 value={search} onChange={(e) => setSearch(e.target.value)}
                 className="flex-1 py-2 pr-3 font-body text-sm bg-transparent outline-none"
                 style={{ color: '#1E2747' }} />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="font-ui font-semibold text-sm px-3 py-2 rounded-pill outline-none"
                style={{ border: '2px solid #101F5C', background: '#FFFDF7', color: '#1E2747' }}>
          <option value="">Todos los estados</option>
          <option value="active">Activa</option>
          <option value="paused">Pausada</option>
          <option value="pending">Pendiente</option>
          <option value="cancelled">Cancelada</option>
          <option value="expired">Expirada</option>
        </select>
        <select value={plan_type} onChange={(e) => setPlanType(e.target.value)}
                className="font-ui font-semibold text-sm px-3 py-2 rounded-pill outline-none"
                style={{ border: '2px solid #101F5C', background: '#FFFDF7', color: '#1E2747' }}>
          <option value="">Todos los planes</option>
          <option value="mensual">Mensual</option>
          <option value="trimestral">Trimestral</option>
          <option value="semestral">Semestral</option>
          <option value="anual">Anual</option>
          <option value="regalo">Regalo</option>
        </select>
      </div>

      {loading && <div className="py-10 text-center font-ui text-sm text-grey tracking-wide">Cargando suscripciones…</div>}

      {!loading && error && (
        <div className="rounded-card p-4 font-ui font-semibold text-sm"
             style={{ background: '#FCE3DF', color: '#7A1A10', border: '1.5px solid #B3261A' }}>
          Error: {error}
        </div>
      )}

      {!loading && !error && suscripciones.length === 0 && (
        <div className="bg-paper rounded-card p-14 text-center shadow-yel"
             style={{ border: '2px solid #101F5C' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
               style={{ background: '#BBD3F5' }}>
            <CreditCard size={24} color="#101F5C" />
          </div>
          <h2 className="font-display text-navy mb-2" style={{ fontSize: '1.5rem' }}>
            {search || status || plan_type ? 'Sin resultados' : 'Sin suscripciones todavía'}
          </h2>
          <p className="font-body text-grey mb-6 text-sm">
            {search || status || plan_type ? 'Prueba con otros filtros.' : 'Registra la primera suscripción de un socio.'}
          </p>
          {!search && !status && !plan_type && (
            <Link to="/suscripciones/nueva" className="btn btn-y"><Plus size={15} /> Nueva suscripción</Link>
          )}
        </div>
      )}

      {!loading && !error && suscripciones.length > 0 && (
        <div className="overflow-x-auto rounded-card" style={{ border: '2px solid #101F5C' }}>
          <table className="w-full text-sm font-body" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8F1E2', borderBottom: '2px solid #101F5C' }}>
                {['Socio', 'Plan', 'Precio', 'Estado', 'Pago', 'Próxima factura', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-ui font-bold text-[.68rem] tracking-[.14em] uppercase text-blue">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suscripciones.map((s, i) => {
                const ss = STATUS_STYLE[s.status]   || STATUS_STYLE.pending
                const ps = PLAN_STYLE[s.plan_type]  || PLAN_STYLE.mensual
                return (
                  <tr key={s.id}
                      style={{ background: i % 2 === 0 ? '#FFFDF7' : '#F8F1E2', borderBottom: '1px solid #D9D2BF' }}>
                    <td className="px-4 py-3">
                      <div className="font-ui font-semibold text-navy whitespace-nowrap">
                        {s.customer?.first_name} {s.customer?.last_name}
                      </div>
                      <div className="text-grey text-xs">{s.customer?.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge" style={ps}>{PLAN_LABEL[s.plan_type]}</span>
                      {s.plan_name && <div className="text-grey text-xs mt-1">{s.plan_name}</div>}
                    </td>
                    <td className="px-4 py-3 font-ui font-semibold text-navy whitespace-nowrap">
                      {Number(s.price).toFixed(2)} {s.currency}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge" style={ss}>{STATUS_LABEL[s.status]}</span>
                    </td>
                    <td className="px-4 py-3 text-grey text-xs">
                      {METHOD_LABEL[s.payment_method] || s.payment_method}
                    </td>
                    <td className="px-4 py-3 text-grey text-xs whitespace-nowrap">
                      {s.next_billing_date ? new Date(s.next_billing_date).toLocaleDateString('es-ES') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => navigate(`/suscripciones/${s.id}`)}
                                title="Ver" className="p-1.5 rounded transition-colors hover:bg-sky"
                                style={{ color: '#1D3FAE' }}><Eye size={15} /></button>
                        <button onClick={() => navigate(`/suscripciones/${s.id}/editar`)}
                                title="Editar" className="p-1.5 rounded transition-colors hover:bg-yel"
                                style={{ color: '#101F5C' }}><Pencil size={15} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
