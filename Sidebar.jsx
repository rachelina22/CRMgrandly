import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import {
  LayoutDashboard, Users, Clock, Package, CreditCard,
  Gamepad2, Calendar, Megaphone, Star, AlertCircle,
  BarChart3, LogOut,
} from 'lucide-react'

const Logo = () => (
  <svg width="34" height="31" viewBox="0 0 44 40" aria-hidden="true">
    <path d="M2 40V18a9 9 0 0 1 18 0v22z" fill="#1D3FAE" />
    <path d="M13 40V12a10 10 0 0 1 20 0v28z" fill="#E5392B" opacity=".96" />
    <path d="M26 40V20a8 8 0 0 1 16 0v20z" fill="#F7C531" />
  </svg>
)

const ACTIVE = [
  { href: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard'        },
  { href: '/clientes',       icon: Users,           label: 'Clientes'         },
  { href: '/espera',         icon: Clock,           label: 'Lista de espera'  },
  { href: '/suscripciones',  icon: CreditCard,      label: 'Suscripciones'    },
]

const SOON = [
  { icon: Package,      label: 'Pedidos y envíos' },
  { icon: Gamepad2,     label: 'Juegos'            },
  { icon: Calendar,     label: 'Eventos'           },
  { icon: Megaphone,    label: 'Marketing'         },
  { icon: Star,         label: 'Fidelización'      },
  { icon: AlertCircle,  label: 'Incidencias'       },
  { icon: BarChart3,    label: 'Analítica'         },
]

export default function Sidebar() {
  const { signOut, user } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 flex flex-col overflow-y-auto z-40"
      style={{ width: 224, background: '#101F5C', color: '#DCE3F8', paddingTop: 6 }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,.1)' }}>
        <div className="flex items-center gap-2.5 mb-2">
          <Logo />
          <span className="font-ui font-bold text-white tracking-[.22em] text-lg">GRANDLY</span>
        </div>
        <div
          className="font-ui font-semibold text-[.72rem] tracking-[.14em] uppercase mb-2.5"
          style={{ color: '#F7C531' }}
        >
          Centro de Operaciones
        </div>
        <span
          className="inline-flex items-center gap-1.5 font-ui font-bold text-[.68rem] tracking-wide uppercase rounded-full px-2.5 py-0.5"
          style={{ background: '#F7C531', color: '#101F5C' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-navy inline-block" style={{ background: '#101F5C' }} />
          Fases 3–4 · Activa
        </span>
      </div>

      {/* Nav activa */}
      <div className="pt-5">
        <div
          className="px-5 pb-2 font-ui font-bold text-[.68rem] tracking-[.15em] uppercase"
          style={{ color: '#F7C531' }}
        >
          Módulos activos
        </div>
        <ul>
          {ACTIVE.map(({ href, icon: Icon, label }) => (
            <li key={href}>
              <NavLink
                to={href}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-5 py-2 font-ui font-medium text-sm transition-colors border-l-[3px] ` +
                  (isActive
                    ? 'text-white border-[#F7C531] bg-white/10'
                    : 'text-[#9EB0DC] border-transparent hover:text-white hover:bg-white/[.06]')
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Próximas fases */}
      <div className="pt-5 flex-1">
        <div
          className="px-5 pb-2 font-ui font-bold text-[.68rem] tracking-[.15em] uppercase opacity-40"
          style={{ color: '#F7C531' }}
        >
          Próximas fases
        </div>
        <ul>
          {SOON.map(({ icon: Icon, label }) => (
            <li key={label}>
              <span
                className="flex items-center gap-2.5 px-5 py-1.5 font-ui text-[.8rem] opacity-25 cursor-not-allowed"
                style={{ color: '#9EB0DC' }}
              >
                <Icon size={14} />
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Usuario + logout */}
      <div
        className="px-5 pt-4 pb-6 mt-auto"
        style={{ borderTop: '1px solid rgba(255,255,255,.1)' }}
      >
        <div
          className="text-[.72rem] font-ui mb-2 truncate opacity-50"
          style={{ color: '#DCE3F8' }}
        >
          {user?.email}
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 font-ui font-semibold text-[.78rem] tracking-wide uppercase opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: '#DCE3F8' }}
        >
          <LogOut size={13} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
