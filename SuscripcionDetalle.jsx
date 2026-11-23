import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  obtenerSuscripcion, eliminarSuscripcion,
  pausarSuscripcion, cancelarSuscripcion, reactivarSuscripcion
} from '../../hooks/useSuscripciones'
import { ChevronLeft, Pencil, Trash2, PauseCircle, XCircle, PlayCircle } from 'lucide-react'

const STATUS_LABEL = { active:'Activa', paused:'Pausada', cancelled:'Cancelada', expired:'Expirada', pending:'Pendiente' }
const STATUS_STYLE = {
  active:    { background: '#DCEFD9', color: '#17421A', borderColor: '#17421A' },
  paused:    { background: '#FFF3CD', color: '#7A5500', borderColor: '#A07000' },
  cancelled: { background: '#FCE3DF', color: '#7A1A10', borderColor: '#7A1A10' },
  expired:   { background: '#F3F4F6', color: '#6B7280', borderColor: '#9CA3AF' },
  pending:   { background: '#BBD3F5', color: '#101F5C', borderColor: '#1D3FAE' },
}
const PLAN_LABEL  = { mensual:'Mensual', trimestral:'Trimestral', semestral:'Semestral', anual:'Anual', regalo:'Regalo' }
const PLAN_STYLE  = {
  mensual:    { background: '#F8F1E2', color: '#1E2747', borderColor: '#D9D2BF' },
  trimestral: { background: '#BBD3F5', color: '#101F5C', borderColor: '#1D3FAE' },
  semestral:  { background: '#D4EDE9', color: '#1A4A44', borderColor: '#1A4A44' },
  anual:      { background: '#F7C531', color: '#101F5C', borderColor: '#101F5C' },
  regalo:     { background: '#F4B9C2', color: '#7A1A3A', borderColor: '#7A1A3A' },
}
const METHOD_LABEL = { domiciliacion:'Domiciliación', tarjeta:'Tarjeta', transferencia:'Transferencia', efectivo:'Efectivo', otro:'Otro' }

function DataRow({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex gap-3 py-2.5" style={{ borderBottom: '1px solid #D9D2BF' }}>
      <span className="font-ui font-semibold text-[.72rem] tracking-[.08em] uppercase text-blue flex-shrink-0 w-40 mt-0.5">{label}</span>
      <span className="font-body text-sm text-ink">{value}</span>
    </div>
  )
}

export default function SuscripcionDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sub, setSub]           = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [working, setWorking]   = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [cancelReason,  setCancelReason]  = useState('')

  const load = async () => {
    setLoading(true)
    try { setSub(await obtenerSuscripcion(id)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [id])

  const handleDelete = async () => {
    setWorking(true)
    try { await eliminarSuscripcion(id); navigate('/suscripciones') }
    catch (e) { setError(e.message); setWorking(false); setConfirmDelete(false) }
  }
  const handlePausar = async () => {
    setWorking(true)
    try { setSub(await pausarSuscripcion(id)) }
    catch (e) { setError(e.message) }
    finally { setWorking(false) }
  }
  const handleCancelar = async () => {
    setWorking(true)
    try { setSub(await cancelarSuscripcion(id, cancelReason)); setConfirmCancel(false) }
    catch (e) { setError(e.message) }
    finally { setWorking(false) }
  }
  const handleReactivar = async () => {
    setWorking(true)
    try { setSub(await reactivarSuscripcion(id)) }
    catch (e) { setError(e.message) }
    finally { setWorking(false) }
  }

  if (loading) return <div className="pt-24 text-center font-ui text-sm text-grey tracking-wide">Cargando…</div>
  if (error)   return (
    <div className="rounded-card p-4 font-ui font-semibold text-sm"
         style={{ background: '#FCE3DF', color: '#7A1A10', border: '1.5px solid #B3261A' }}>{error}</div>
  )
  if (!sub) return null

  const ss = STATUS_STYLE[sub.status]   || STATUS_STYLE.pending
  const ps = PLAN_STYLE[sub.plan_type]  || PLAN_STYLE.mensual

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/suscripciones')}
                className="flex items-center gap-1.5 font-ui font-semibold text-sm text-grey mb-4 hover:text-navy transition-colors">
          <ChevronLeft size={16} /> Volver a suscripciones
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex gap-2 mb-2 flex-wrap">
              <span className="badge" style={ss}>{STATUS_LABEL[sub.status]}</span>
              <span className="badge" style={ps}>{PLAN_LABEL[sub.plan_type]}</span>
            </div>
            <h1 className="font-display text-navy mb-0.5"
                style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', lineHeight: 1.05 }}>
              {sub.plan_name || `Plan ${PLAN_LABEL[sub.plan_type]}`}
            </h1>
            {sub.customer && (
              <Link to={`/clientes/${sub.customer.id}`}
                    className="font-body text-blue text-sm hover:underline">
                {sub.customer.first_name} {sub.customer.last_name} · {sub.customer.email}
              </Link>
            )}
          </div>

          <div className="flex gap-2 flex-wrap flex-shrink-0">
            {sub.status === 'active' && (
              <button onClick={handlePausar} disabled={working} className="btn">
                <PauseCircle size={14} /> {working ? '…' : 'Pausar'}
              </button>
            )}
            {(sub.status === 'paused' || sub.status === 'pending') && (
              <button onClick={handleReactivar} disabled={working} className="btn btn-p">
                <PlayCircle size={14} /> {working ? '…' : 'Reactivar'}
              </button>
            )}
            {(sub.status === 'active' || sub.status === 'paused') && !confirmCancel && (
              <button onClick={() => setConfirmCancel(true)} disabled={working} className="btn"
                      style={{ borderColor: '#E5392B', color: '#E5392B' }}>
                <XCircle size={14} /> Cancelar suscripción
              </button>
            )}
            {confirmCancel && (
              <div className="bg-paper rounded-card px-4 py-3 flex flex-col gap-2"
                   style={{ border: '2px solid #E5392B', minWidth: 260 }}>
                <span className="font-ui font-semibold text-sm" style={{ color: '#B3261A' }}>
                  Motivo de cancelación (opcional)
                </span>
                <input value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                       className="inp" placeholder="Ej. precio, mudanza, baja voluntaria…" />
                <div className="flex gap-2">
                  <button onClick={handleCancelar} disabled={working} className="btn btn-p"
                          style={{ background: '#E5392B', borderColor: '#E5392B', flex:1, justifyContent:'center' }}>
                    {working ? 'Cancelando…' : 'Confirmar cancelación'}
                  </button>
                  <button onClick={() => setConfirmCancel(false)} className="btn">No</button>
                </div>
              </div>
            )}

            <Link to={`/suscripciones/${id}/editar`} className="btn">
              <Pencil size={14} /> Editar
            </Link>

            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className="btn"
                      style={{ borderColor: '#E5392B', color: '#E5392B' }}>
                <Trash2 size={14} /> Eliminar
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-paper rounded-card px-4 py-2"
                   style={{ border: '2px solid #E5392B' }}>
                <span className="font-ui font-semibold text-sm" style={{ color: '#B3261A' }}>¿Eliminar registro?</span>
                <button onClick={handleDelete} disabled={working} className="btn btn-p"
                        style={{ background: '#E5392B', borderColor: '#E5392B', minHeight:'2rem', padding:'0 .75rem', fontSize:'.75rem' }}>
                  {working ? '…' : 'Sí'}
                </button>
                <button onClick={() => setConfirmDelete(false)} className="btn"
                        style={{ minHeight:'2rem', padding:'0 .75rem', fontSize:'.75rem' }}>
                  No
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>

        {/* Datos del plan */}
        <div className="bg-paper rounded-card p-5" style={{ border: '2px solid #101F5C' }}>
          <h2 className="font-ui font-bold text-navy text-sm tracking-[.1em] uppercase mb-3"
              style={{ borderBottom: '2px solid #101F5C', paddingBottom: 10 }}>
            Datos del plan
          </h2>
          <DataRow label="Precio"           value={`${Number(sub.price).toFixed(2)} ${sub.currency}`} />
          <DataRow label="Método de pago"   value={METHOD_LABEL[sub.payment_method] || sub.payment_method} />
          <DataRow label="Referencia"       value={sub.payment_reference} />
          <DataRow label="Inicio"           value={sub.start_date ? new Date(sub.start_date).toLocaleDateString('es-ES') : null} />
          <DataRow label="Fin"              value={sub.end_date ? new Date(sub.end_date).toLocaleDateString('es-ES') : 'Sin fecha fin'} />
          <DataRow label="Próxima factura"  value={sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString('es-ES') : null} />
          {sub.paused_at && (
            <DataRow label="Pausada el"     value={new Date(sub.paused_at).toLocaleDateString('es-ES')} />
          )}
          {sub.cancelled_at && (
            <DataRow label="Cancelada el"   value={new Date(sub.cancelled_at).toLocaleDateString('es-ES')} />
          )}
          {sub.cancellation_reason && (
            <DataRow label="Motivo baja"    value={sub.cancellation_reason} />
          )}
        </div>

        {/* Notas + enlace socio */}
        <div className="bg-paper rounded-card p-5" style={{ border: '2px solid #101F5C' }}>
          <h2 className="font-ui font-bold text-navy text-sm tracking-[.1em] uppercase mb-3"
              style={{ borderBottom: '2px solid #101F5C', paddingBottom: 10 }}>
            Notas y socio
          </h2>
          {sub.notes && (
            <p className="font-body text-sm text-ink leading-relaxed mb-4"
               style={{ background: '#F8F1E2', borderRadius: 6, padding: '10px 12px' }}>
              {sub.notes}
            </p>
          )}
          {sub.customer && (
            <Link to={`/clientes/${sub.customer.id}`}
                  className="btn" style={{ width: '100%', justifyContent: 'center' }}>
              Ver ficha completa del socio
            </Link>
          )}
          <div className="mt-3">
            <Link to={`/suscripciones/nueva?customer_id=${sub.customer_id}`}
                  className="btn" style={{ width: '100%', justifyContent: 'center' }}>
              + Añadir otra suscripción a este socio
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
