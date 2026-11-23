import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useClientes } from '../../hooks/useClientes'
import { Search, Plus, Eye, Pencil, Users } from 'lucide-react'

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

export default function ClientesPage() {
  const [search, setSearch]           = useState('')
  const [status, setStatus]           = useState('')
  const [member_type, setMemberType]  = useState('')
  const navigate = useNavigate()

  const { clientes, loading, error, total } = useClientes({ search, status, member_type })

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <div className="eyebrow">Módulo</div>
          <h1 className="font-display text-navy mb-1" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', lineHeight: 1.05 }}>
            Clientes
          </h1>
          {!loading && (
            <p className="font-body text-grey text-sm">
              {total} {total === 1 ? 'cliente' : 'clientes'} en base de datos
            </p>
          )}
        </div>
        <Link to="/clientes/nuevo" className="btn btn-p flex-shrink-0">
          <Plus size={15} />
          Nuevo cliente
        </Link>
      </div>

      {/* Filtros */}
      <div
        className="bg-paper rounded-card p-4 mb-5 flex gap-3 flex-wrap items-center"
        style={{ border: '2px solid #101F5C' }}
      >
        {/* Búsqueda */}
        <div
          className="flex items-center gap-2 flex-1"
          style={{
            minWidth: 200,
            border: '2px solid #101F5C',
            borderRadius: 8,
            background: '#FFFDF7',
            paddingLeft: 12,
          }}
        >
          <Search size={14} color="#4A5272" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 py-2 pr-3 font-body text-sm text-ink bg-transparent outline-none"
            style={{ color: '#1E2747' }}
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="font-ui font-semibold text-sm px-3 py-2 rounded-pill outline-none"
          style={{ border: '2px solid #101F5C', background: '#FFFDF7', color: '#1E2747' }}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="pending">Pendiente</option>
          <option value="cancelled">Cancelado</option>
        </select>

        <select
          value={member_type}
          onChange={(e) => setMemberType(e.target.value)}
          className="font-ui font-semibold text-sm px-3 py-2 rounded-pill outline-none"
          style={{ border: '2px solid #101F5C', background: '#FFFDF7', color: '#1E2747' }}
        >
          <option value="">Todos los tipos</option>
          <option value="standard">Estándar</option>
          <option value="premium">Premium</option>
          <option value="vip">VIP</option>
          <option value="paused">Pausado</option>
        </select>
      </div>

      {/* Estados */}
      {loading && (
        <div className="py-10 text-center font-ui text-sm text-grey tracking-wide">
          Cargando clientes desde Supabase…
        </div>
      )}

      {!loading && error && (
        <div
          className="rounded-card p-4 font-ui font-semibold text-sm"
          style={{ background: '#FCE3DF', color: '#7A1A10', border: '1.5px solid #B3261A' }}
        >
          Error al cargar clientes: {error}
        </div>
      )}

      {!loading && !error && clientes.length === 0 && (
        <div
          className="bg-paper rounded-card p-14 text-center shadow-yel"
          style={{ border: '2px solid #101F5C' }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#BBD3F5' }}
          >
            <Users size={24} color="#101F5C" />
          </div>
          <h2 className="font-display text-navy mb-2" style={{ fontSize: '1.5rem' }}>
            {search || status || member_type ? 'Sin resultados' : 'Todavía sin clientes'}
          </h2>
          <p className="font-body text-grey mb-6 text-sm">
            {search || status || member_type
              ? 'Prueba con otros filtros o términos de búsqueda.'
              : 'Crea el primer cliente de GRANDLY para empezar.'}
          </p>
          {!search && !status && !member_type && (
            <Link to="/clientes/nuevo" className="btn btn-y">
              <Plus size={15} />
              Crear primer cliente
            </Link>
          )}
        </div>
      )}

      {/* Tabla */}
      {!loading && !error && clientes.length > 0 && (
        <div
          className="overflow-x-auto rounded-card"
          style={{ border: '2px solid #101F5C' }}
        >
          <table className="w-full text-sm font-body" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8F1E2', borderBottom: '2px solid #101F5C' }}>
                {['Nombre', 'Email', 'Teléfono', 'Tipo', 'Estado', 'Alta', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-ui font-bold text-[.68rem] tracking-[.14em] uppercase text-blue"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clientes.map((c, i) => {
                const ss = STATUS_STYLE[c.status] || STATUS_STYLE.inactive
                const ms = MEMBER_STYLE[c.member_type] || MEMBER_STYLE.standard
                return (
                  <tr
                    key={c.id}
                    style={{
                      background: i % 2 === 0 ? '#FFFDF7' : '#F8F1E2',
                      borderBottom: '1px solid #D9D2BF',
                    }}
                  >
                    <td className="px-4 py-3 font-ui font-semibold text-navy whitespace-nowrap">
                      {c.first_name} {c.last_name}
                    </td>
                    <td className="px-4 py-3 text-grey">{c.email}</td>
                    <td className="px-4 py-3 text-grey">{c.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="badge" style={ms}>
                        {MEMBER_LABEL[c.member_type] || c.member_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge" style={ss}>
                        {STATUS_LABEL[c.status] || c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-grey text-xs whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => navigate(`/clientes/${c.id}`)}
                          title="Ver ficha"
                          className="p-1.5 rounded transition-colors hover:bg-sky"
                          style={{ color: '#1D3FAE' }}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => navigate(`/clientes/${c.id}/editar`)}
                          title="Editar"
                          className="p-1.5 rounded transition-colors hover:bg-yel"
                          style={{ color: '#101F5C' }}
                        >
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
