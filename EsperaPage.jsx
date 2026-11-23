import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useEspera } from '../../hooks/useEspera'
import { Search, Plus, Eye, Pencil, Clock } from 'lucide-react'

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

export default function EsperaPage() {
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('')
  const [priority, setPriority] = useState('')
  const navigate = useNavigate()

  const { espera, loading, error, total } = useEspera({ search, status, priority })

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <div className="eyebrow">Módulo</div>
          <h1 className="font-display text-navy mb-1" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', lineHeight: 1.05 }}>
            Lista de espera
          </h1>
          {!loading && (
            <p className="font-body text-grey text-sm">
              {total} {total === 1 ? 'solicitud' : 'solicitudes'} registradas
            </p>
          )}
        </div>
        <Link to="/espera/nueva" className="btn btn-p flex-shrink-0">
          <Plus size={15} />
          Nueva solicitud
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-paper rounded-card p-4 mb-5 flex gap-3 flex-wrap items-center"
           style={{ border: '2px solid #101F5C' }}>
        <div className="flex items-center gap-2 flex-1"
             style={{ minWidth: 200, border: '2px solid #101F5C', borderRadius: 8, background: '#FFFDF7', paddingLeft: 12 }}>
          <Search size={14} color="#4A5272" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 py-2 pr-3 font-body text-sm bg-transparent outline-none"
            style={{ color: '#1E2747' }}
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="font-ui font-semibold text-sm px-3 py-2 rounded-pill outline-none"
                style={{ border: '2px solid #101F5C', background: '#FFFDF7', color: '#1E2747' }}>
          <option value="">Todos los estados</option>
          <option value="pending">En espera</option>
          <option value="contacted">Contactado</option>
          <option value="approved">Aprobado</option>
          <option value="rejected">Rechazado</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}
                className="font-ui font-semibold text-sm px-3 py-2 rounded-pill outline-none"
                style={{ border: '2px solid #101F5C', background: '#FFFDF7', color: '#1E2747' }}>
          <option value="">Todas las prioridades</option>
          <option value="2">Urgente</option>
          <option value="1">Alta</option>
          <option value="0">Normal</option>
        </select>
      </div>

      {loading && (
        <div className="py-10 text-center font-ui text-sm text-grey tracking-wide">
          Cargando lista de espera…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-card p-4 font-ui font-semibold text-sm"
             style={{ background: '#FCE3DF', color: '#7A1A10', border: '1.5px solid #B3261A' }}>
          Error: {error}
        </div>
      )}

      {!loading && !error && espera.length === 0 && (
        <div className="bg-paper rounded-card p-14 text-center shadow-yel"
             style={{ border: '2px solid #101F5C' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
               style={{ background: '#FFF3CD' }}>
            <Clock size={24} color="#101F5C" />
          </div>
          <h2 className="font-display text-navy mb-2" style={{ fontSize: '1.5rem' }}>
            {search || status || priority !== '' ? 'Sin resultados' : 'Lista de espera vacía'}
          </h2>
          <p className="font-body text-grey mb-6 text-sm">
            {search || status || priority !== ''
              ? 'Prueba con otros filtros.'
              : 'Añade la primera solicitud para empezar a gestionar el acceso al club.'}
          </p>
          {!search && !status && priority === '' && (
            <Link to="/espera/nueva" className="btn btn-y">
              <Plus size={15} />
              Añadir solicitud
            </Link>
          )}
        </div>
      )}

      {!loading && !error && espera.length > 0 && (
        <div className="overflow-x-auto rounded-card" style={{ border: '2px solid #101F5C' }}>
          <table className="w-full text-sm font-body" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8F1E2', borderBottom: '2px solid #101F5C' }}>
                {['Nombre', 'Email', 'Teléfono', 'Estado', 'Prioridad', 'Solicitud', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-ui font-bold text-[.68rem] tracking-[.14em] uppercase text-blue">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {espera.map((e, i) => {
                const ss = STATUS_STYLE[e.status]   || STATUS_STYLE.pending
                const ps = PRIORITY_STYLE[e.priority] || PRIORITY_STYLE[0]
                return (
                  <tr key={e.id}
                      style={{ background: i % 2 === 0 ? '#FFFDF7' : '#F8F1E2', borderBottom: '1px solid #D9D2BF' }}>
                    <td className="px-4 py-3 font-ui font-semibold text-navy whitespace-nowrap">
                      {e.first_name} {e.last_name}
                    </td>
                    <td className="px-4 py-3 text-grey">{e.email}</td>
                    <td className="px-4 py-3 text-grey">{e.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="badge" style={ss}>{STATUS_LABEL[e.status]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge" style={ps}>{PRIORITY_LABEL[e.priority]}</span>
                    </td>
                    <td className="px-4 py-3 text-grey text-xs whitespace-nowrap">
                      {new Date(e.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => navigate(`/espera/${e.id}`)}
                                title="Ver" className="p-1.5 rounded transition-colors hover:bg-sky"
                                style={{ color: '#1D3FAE' }}>
                          <Eye size={15} />
                        </button>
                        <button onClick={() => navigate(`/espera/${e.id}/editar`)}
                                title="Editar" className="p-1.5 rounded transition-colors hover:bg-yel"
                                style={{ color: '#101F5C' }}>
                          <Pencil size={15} />
                        </button>
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
