import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { obtenerCliente, eliminarCliente, agregarInteraccion } from '../../hooks/useClientes'
import { ChevronLeft, Pencil, Trash2, Plus, MessageSquare } from 'lucide-react'

const STATUS_LABEL = { active: 'Activo', inactive: 'Inactivo', pending: 'Pendiente', cancelled: 'Cancelado' }
const STATUS_STYLE = {
  active:    { background: '#DCEFD9', color: '#17421A', borderColor: '#17421A' },
  inactive:  { background: '#F3F4F6', color: '#6B7280', borderColor: '#9CA3AF' },
  pending:   { background: '#FFF3CD', color: '#7A5500', borderColor: '#A07000' },
  cancelled: { background: '#FCE3DF', color: '#7A1A10', borderColor: '#7A1A10' },
}
const MEMBER_LABEL = { standard: 'Estándar', premium: 'Premium', vip: 'VIP', paused: 'Pausado' }
const MEMBER_STYLE = {
  standard: { background: '#F8F1E2', color: '#1E2747', borderColor: '#D9D2BF' },
  premium:  { background: '#BBD3F5', color: '#101F5C', borderColor: '#1D3FAE' },
  vip:      { background: '#F7C531', color: '#101F5C', borderColor: '#101F5C' },
  paused:   { background: '#F3F4F6', color: '#6B7280', borderColor: '#9CA3AF' },
}
const TIPO_LABEL = {
  nota: '📝 Nota', llamada: '📞 Llamada', email: '✉️ Email',
  pedido: '📦 Pedido', incidencia: '⚠️ Incidencia',
  evento: '📅 Evento', juego: '🎲 Juego',
  suscripcion: '💳 Suscripción', otro: '• Otro',
}

function DataRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex gap-3 py-2.5" style={{ borderBottom: '1px solid #D9D2BF' }}>
      <span className="font-ui font-semibold text-[.72rem] tracking-[.08em] uppercase text-blue flex-shrink-0 w-36 mt-0.5">
        {label}
      </span>
      <span className="font-body text-sm text-ink">{value}</span>
    </div>
  )
}

export default function ClienteDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Nota rápida
  const [nota, setNota] = useState('')
  const [savingNota, setSavingNota] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await obtenerCliente(id)
      setCliente(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await eliminarCliente(id)
      navigate('/clientes')
    } catch (e) {
      setError(e.message)
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const handleNota = async (e) => {
    e.preventDefault()
    if (!nota.trim()) return
    setSavingNota(true)
    try {
      await agregarInteraccion({ customer_id: id, interaction_type: 'nota', description: nota })
      setNota('')
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSavingNota(false)
    }
  }

  if (loading) return (
    <div className="pt-24 text-center font-ui text-sm text-grey tracking-wide">
      Cargando ficha del cliente…
    </div>
  )

  if (error) return (
    <div className="rounded-card p-4 font-ui font-semibold text-sm"
         style={{ background: '#FCE3DF', color: '#7A1A10', border: '1.5px solid #B3261A' }}>
      {error}
    </div>
  )

  if (!cliente) return null

  const ss = STATUS_STYLE[cliente.status] || STATUS_STYLE.inactive
  const ms = MEMBER_STYLE[cliente.member_type] || MEMBER_STYLE.standard
  const historial = [...(cliente.interaction_history || [])].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  )

  const direccion = [
    cliente.address_line,
    cliente.address_city,
    cliente.address_province,
    cliente.address_postal,
    cliente.address_country,
  ].filter(Boolean).join(', ')

  const comms = [
    cliente.comm_email && 'Email',
    cliente.comm_sms && 'SMS',
    cliente.comm_post && 'Correo postal',
  ].filter(Boolean).join(' · ') || 'Ninguna'

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/clientes')}
          className="flex items-center gap-1.5 font-ui font-semibold text-sm text-grey mb-4 hover:text-navy transition-colors"
        >
          <ChevronLeft size={16} />
          Volver a clientes
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex gap-2 mb-2 flex-wrap">
              <span className="badge" style={ms}>{MEMBER_LABEL[cliente.member_type]}</span>
              <span className="badge" style={ss}>{STATUS_LABEL[cliente.status]}</span>
              {cliente.loyalty_points > 0 && (
                <span className="badge" style={{ background: '#F7C531', color: '#101F5C', borderColor: '#101F5C' }}>
                  {cliente.loyalty_points} pts
                </span>
              )}
            </div>
            <h1 className="font-display text-navy mb-0.5" style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', lineHeight: 1.05 }}>
              {cliente.first_name} {cliente.last_name}
            </h1>
            <p className="font-body text-grey text-sm">{cliente.email}</p>
          </div>

          <div className="flex gap-2 flex-wrap flex-shrink-0">
            <Link to={`/clientes/${id}/editar`} className="btn">
              <Pencil size={14} />
              Editar
            </Link>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="btn"
                style={{ borderColor: '#E5392B', color: '#E5392B' }}
              >
                <Trash2 size={14} />
                Eliminar
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-paper rounded-card px-4 py-2"
                   style={{ border: '2px solid #E5392B' }}>
                <span className="font-ui font-semibold text-sm" style={{ color: '#B3261A' }}>
                  ¿Seguro?
                </span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn btn-p"
                  style={{ background: '#E5392B', borderColor: '#E5392B', minHeight: '2rem', padding: '0 .75rem', fontSize: '.75rem' }}
                >
                  {deleting ? 'Eliminando…' : 'Sí, eliminar'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="btn"
                  style={{ minHeight: '2rem', padding: '0 .75rem', fontSize: '.75rem' }}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>

        {/* Datos */}
        <div className="bg-paper rounded-card p-5" style={{ border: '2px solid #101F5C' }}>
          <h2 className="font-ui font-bold text-navy text-sm tracking-[.1em] uppercase mb-3"
              style={{ borderBottom: '2px solid #101F5C', paddingBottom: 10 }}>
            Datos personales
          </h2>
          <DataRow label="Email"            value={cliente.email} />
          <DataRow label="Teléfono"         value={cliente.phone} />
          <DataRow label="Fecha nacimiento" value={cliente.birth_date
            ? new Date(cliente.birth_date).toLocaleDateString('es-ES') : null} />
          <DataRow label="Captación"        value={cliente.acquisition_source} />
          <DataRow label="Alta en GRANDLY"  value={new Date(cliente.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} />
        </div>

        {/* Dirección y RGPD */}
        <div className="bg-paper rounded-card p-5" style={{ border: '2px solid #101F5C' }}>
          <h2 className="font-ui font-bold text-navy text-sm tracking-[.1em] uppercase mb-3"
              style={{ borderBottom: '2px solid #101F5C', paddingBottom: 10 }}>
            Dirección y comunicaciones
          </h2>
          <DataRow label="Dirección"           value={direccion || null} />
          <DataRow label="Comunicaciones"       value={comms} />
          <DataRow label="Consentimiento RGPD"  value={cliente.gdpr_consent_at
            ? new Date(cliente.gdpr_consent_at).toLocaleDateString('es-ES') : 'No registrado'} />
          {cliente.notes && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid #D9D2BF' }}>
              <p className="font-ui font-semibold text-[.72rem] tracking-[.08em] uppercase text-blue mb-1.5">Notas</p>
              <p className="font-body text-sm text-ink leading-relaxed">{cliente.notes}</p>
            </div>
          )}
        </div>

      </div>

      {/* Historial de interacciones */}
      <div className="mt-5 bg-paper rounded-card p-5" style={{ border: '2px solid #101F5C' }}>
        <h2 className="font-ui font-bold text-navy text-sm tracking-[.1em] uppercase mb-4"
            style={{ borderBottom: '2px solid #101F5C', paddingBottom: 10 }}>
          Historial de interacciones
        </h2>

        {/* Añadir nota rápida */}
        <form onSubmit={handleNota} className="flex gap-2 mb-5 flex-wrap">
          <div className="flex-1" style={{ minWidth: 220 }}>
            <input
              type="text"
              className="inp"
              placeholder="Añadir nota rápida…"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={savingNota || !nota.trim()}
            className="btn btn-p flex-shrink-0"
          >
            <Plus size={14} />
            {savingNota ? 'Guardando…' : 'Añadir nota'}
          </button>
        </form>

        {/* Lista */}
        {historial.length === 0 ? (
          <div className="py-8 text-center">
            <MessageSquare size={28} color="#D9D2BF" className="mx-auto mb-2" />
            <p className="font-body text-grey text-sm">Sin interacciones registradas todavía.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {historial.map((h) => (
              <div
                key={h.id}
                className="flex gap-3 items-start px-3 py-2.5 rounded-[6px]"
                style={{ background: '#F8F1E2' }}
              >
                <div className="font-ui font-bold text-[.72rem] text-blue mt-0.5 flex-shrink-0 min-w-[6rem]">
                  {TIPO_LABEL[h.interaction_type] || h.interaction_type}
                </div>
                <div className="flex-1 font-body text-sm text-ink">{h.description || '—'}</div>
                <div className="font-ui text-[.7rem] text-grey flex-shrink-0">
                  {new Date(h.created_at).toLocaleDateString('es-ES')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
