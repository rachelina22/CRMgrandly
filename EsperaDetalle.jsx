import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  obtenerEntrada, eliminarEntrada, marcarContactado, aprobarEntrada
} from '../../hooks/useEspera'
import { crearCliente } from '../../hooks/useClientes'
import { ChevronLeft, Pencil, Trash2, Phone, CheckCircle, UserPlus } from 'lucide-react'

const STATUS_LABEL = {
  pending:   'En espera',
  contacted: 'Contactado',
  approved:  'Aprobado',
  rejected:  'Rechazado',
  cancelled: 'Cancelado',
}
const STATUS_STYLE = {
  pending:   { background: '#FFF3CD', color: '#7A5500', borderColor: '#A07000' },
  contacted: { background: '#BBD3F5', color: '#101F5C', borderColor: '#1D3FAE' },
  approved:  { background: '#DCEFD9', color: '#17421A', borderColor: '#17421A' },
  rejected:  { background: '#FCE3DF', color: '#7A1A10', borderColor: '#7A1A10' },
  cancelled: { background: '#F3F4F6', color: '#6B7280', borderColor: '#9CA3AF' },
}
const PRIORITY_LABEL = { 0: 'Normal', 1: 'Alta', 2: 'Urgente' }
const PRIORITY_STYLE = {
  0: { background: '#F8F1E2', color: '#1E2747', borderColor: '#D9D2BF' },
  1: { background: '#F7C531', color: '#101F5C', borderColor: '#101F5C' },
  2: { background: '#E5392B', color: '#fff',    borderColor: '#B3261A' },
}
const INTEREST_LABEL = {
  juegos: 'Juegos de mesa', lectura: 'Lectura', manualidades: 'Manualidades',
  musica: 'Música', gastronomia: 'Gastronomía', teatro: 'Teatro',
  cine: 'Cine', tecnologia: 'Tecnología', actividades_fisicas: 'Act. físicas',
  conversacion: 'Conversación',
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

export default function EsperaDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [entrada, setEntrada]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [working, setWorking]       = useState(false)
  const [confirmAprobar, setConfirmAprobar] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setEntrada(await obtenerEntrada(id))
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try { await eliminarEntrada(id); navigate('/espera') }
    catch (e) { setError(e.message); setDeleting(false); setConfirmDelete(false) }
  }

  const handleContactado = async () => {
    setWorking(true)
    try { setEntrada(await marcarContactado(id)) }
    catch (e) { setError(e.message) }
    finally { setWorking(false) }
  }

  // Aprobar: crea un cliente nuevo con los datos de la solicitud
  const handleAprobar = async () => {
    setWorking(true)
    try {
      const cliente = await crearCliente({
        first_name:        entrada.first_name,
        last_name:         entrada.last_name,
        email:             entrada.email,
        phone:             entrada.phone       || null,
        birth_date:        entrada.birth_date  || null,
        acquisition_source: entrada.acquisition_source || null,
        comm_email:        entrada.comm_email,
        comm_sms:          entrada.comm_sms,
        comm_post:         true,
        gdpr_consent_at:   entrada.gdpr_consent_at || null,
        status:            'active',
        member_type:       'standard',
        notes:             entrada.message || null,
      })
      await aprobarEntrada(id, cliente.id)
      navigate(`/clientes/${cliente.id}`)
    } catch (e) {
      setError(e.message)
      setWorking(false)
      setConfirmAprobar(false)
    }
  }

  if (loading) return <div className="pt-24 text-center font-ui text-sm text-grey tracking-wide">Cargando…</div>
  if (error)   return (
    <div className="rounded-card p-4 font-ui font-semibold text-sm"
         style={{ background: '#FCE3DF', color: '#7A1A10', border: '1.5px solid #B3261A' }}>{error}</div>
  )
  if (!entrada) return null

  const ss = STATUS_STYLE[entrada.status]    || STATUS_STYLE.pending
  const ps = PRIORITY_STYLE[entrada.priority] || PRIORITY_STYLE[0]
  const interests = entrada.interests || []

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/espera')}
                className="flex items-center gap-1.5 font-ui font-semibold text-sm text-grey mb-4 hover:text-navy transition-colors">
          <ChevronLeft size={16} /> Volver a lista de espera
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex gap-2 mb-2 flex-wrap">
              <span className="badge" style={ss}>{STATUS_LABEL[entrada.status]}</span>
              <span className="badge" style={ps}>{PRIORITY_LABEL[entrada.priority]}</span>
            </div>
            <h1 className="font-display text-navy mb-0.5"
                style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', lineHeight: 1.05 }}>
              {entrada.first_name} {entrada.last_name}
            </h1>
            <p className="font-body text-grey text-sm">{entrada.email}</p>
          </div>

          <div className="flex gap-2 flex-wrap flex-shrink-0">
            {/* Marcar contactado */}
            {entrada.status === 'pending' && (
              <button onClick={handleContactado} disabled={working} className="btn">
                <Phone size={14} />
                {working ? 'Guardando…' : 'Marcar contactado'}
              </button>
            )}

            {/* Aprobar → crear cliente */}
            {(entrada.status === 'pending' || entrada.status === 'contacted') && !confirmAprobar && (
              <button onClick={() => setConfirmAprobar(true)} disabled={working}
                      className="btn btn-p">
                <UserPlus size={14} />
                Aprobar y crear cliente
              </button>
            )}
            {confirmAprobar && (
              <div className="flex items-center gap-2 bg-paper rounded-card px-4 py-2"
                   style={{ border: '2px solid #17421A' }}>
                <span className="font-ui font-semibold text-sm" style={{ color: '#17421A' }}>
                  ¿Crear cliente con estos datos?
                </span>
                <button onClick={handleAprobar} disabled={working}
                        className="btn btn-p"
                        style={{ background: '#17421A', borderColor: '#17421A', minHeight: '2rem', padding: '0 .75rem', fontSize: '.75rem' }}>
                  {working ? 'Creando…' : 'Sí, aprobar'}
                </button>
                <button onClick={() => setConfirmAprobar(false)} className="btn"
                        style={{ minHeight: '2rem', padding: '0 .75rem', fontSize: '.75rem' }}>
                  Cancelar
                </button>
              </div>
            )}

            <Link to={`/espera/${id}/editar`} className="btn">
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
                <span className="font-ui font-semibold text-sm" style={{ color: '#B3261A' }}>¿Seguro?</span>
                <button onClick={handleDelete} disabled={deleting}
                        className="btn btn-p"
                        style={{ background: '#E5392B', borderColor: '#E5392B', minHeight: '2rem', padding: '0 .75rem', fontSize: '.75rem' }}>
                  {deleting ? 'Eliminando…' : 'Sí, eliminar'}
                </button>
                <button onClick={() => setConfirmDelete(false)} className="btn"
                        style={{ minHeight: '2rem', padding: '0 .75rem', fontSize: '.75rem' }}>
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>

        {/* Datos personales */}
        <div className="bg-paper rounded-card p-5" style={{ border: '2px solid #101F5C' }}>
          <h2 className="font-ui font-bold text-navy text-sm tracking-[.1em] uppercase mb-3"
              style={{ borderBottom: '2px solid #101F5C', paddingBottom: 10 }}>
            Datos personales
          </h2>
          <DataRow label="Email"             value={entrada.email} />
          <DataRow label="Teléfono"          value={entrada.phone} />
          <DataRow label="Fecha nacimiento"  value={entrada.birth_date ? new Date(entrada.birth_date).toLocaleDateString('es-ES') : null} />
          <DataRow label="Captación"         value={entrada.acquisition_source} />
          <DataRow label="Solicitud"         value={new Date(entrada.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} />
          {entrada.contacted_at && (
            <DataRow label="Contactado"      value={new Date(entrada.contacted_at).toLocaleDateString('es-ES')} />
          )}
          {entrada.approved_at && (
            <DataRow label="Aprobado"        value={new Date(entrada.approved_at).toLocaleDateString('es-ES')} />
          )}
          {entrada.converted_customer_id && (
            <div className="pt-3">
              <Link to={`/clientes/${entrada.converted_customer_id}`}
                    className="btn btn-p" style={{ fontSize: '.8rem' }}>
                <CheckCircle size={13} /> Ver ficha de cliente
              </Link>
            </div>
          )}
        </div>

        {/* Intereses y mensaje */}
        <div className="bg-paper rounded-card p-5" style={{ border: '2px solid #101F5C' }}>
          <h2 className="font-ui font-bold text-navy text-sm tracking-[.1em] uppercase mb-3"
              style={{ borderBottom: '2px solid #101F5C', paddingBottom: 10 }}>
            Intereses y mensaje
          </h2>

          {interests.length > 0 && (
            <div className="mb-4">
              <p className="eyebrow" style={{ fontSize: '.68rem', marginBottom: 8 }}>Áreas de interés</p>
              <div className="flex flex-wrap gap-2">
                {interests.map((v) => (
                  <span key={v} className="badge"
                        style={{ background: '#BBD3F5', color: '#101F5C', borderColor: '#1D3FAE' }}>
                    {INTEREST_LABEL[v] || v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entrada.message && (
            <div>
              <p className="eyebrow" style={{ fontSize: '.68rem', marginBottom: 6 }}>Mensaje</p>
              <p className="font-body text-sm text-ink leading-relaxed"
                 style={{ background: '#F8F1E2', borderRadius: 6, padding: '10px 12px' }}>
                {entrada.message}
              </p>
            </div>
          )}

          {entrada.internal_notes && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid #D9D2BF' }}>
              <p className="eyebrow" style={{ fontSize: '.68rem', marginBottom: 6 }}>Notas internas</p>
              <p className="font-body text-sm text-ink leading-relaxed">{entrada.internal_notes}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
