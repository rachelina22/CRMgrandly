import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

const Logo = () => (
  <svg width="52" height="47" viewBox="0 0 44 40" aria-label="GRANDLY">
    <path d="M2 40V18a9 9 0 0 1 18 0v22z" fill="#1D3FAE" />
    <path d="M13 40V12a10 10 0 0 1 20 0v28z" fill="#E5392B" opacity=".96" />
    <path d="M26 40V20a8 8 0 0 1 16 0v20z" fill="#F7C531" />
  </svg>
)

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { signIn }  = useAuthStore()
  const navigate    = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch {
      setError('Email o contraseña incorrectos. Verifica tus credenciales de Supabase.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="stripe-bar" style={{ height: 6 }} />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full" style={{ maxWidth: 360 }}>

          {/* Logo centrado */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4"><Logo /></div>
            <p className="font-ui font-bold text-navy tracking-[.22em] text-xl uppercase mb-1">
              GRANDLY
            </p>
            <p className="font-ui font-semibold text-[.75rem] tracking-[.14em] uppercase text-grey">
              Centro de Operaciones
            </p>
          </div>

          {/* Card con sombra offset amarilla */}
          <div
            className="bg-paper rounded-card p-8 shadow-yel"
            style={{ border: '2px solid #101F5C' }}
          >
            <h1 className="font-display text-navy mb-1" style={{ fontSize: '1.75rem' }}>
              Acceder
            </h1>
            <p className="font-body text-grey text-sm mb-6">
              Solo para administradores de GRANDLY
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="eyebrow" style={{ fontSize: '.72rem', marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  className="inp"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="eyebrow" style={{ fontSize: '.72rem', marginBottom: 6 }}>
                  Contraseña
                </label>
                <input
                  type="password"
                  className="inp"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div
                  className="text-sm font-ui font-semibold rounded-md px-3 py-2.5"
                  style={{ background: '#FCE3DF', color: '#7A1A10', border: '1.5px solid #B3261A' }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-p w-full mt-1"
                style={{ minHeight: '3rem' }}
              >
                {loading ? 'Entrando…' : 'Entrar al CRM'}
              </button>
            </form>
          </div>

          <p className="text-center font-body text-grey text-xs mt-6">
            Acceso exclusivo para el equipo de GRANDLY
          </p>
        </div>
      </div>
    </div>
  )
}
