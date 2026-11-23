import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/authStore'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ClientesPage from './pages/clientes/ClientesPage'
import ClienteForm from './pages/clientes/ClienteForm'
import ClienteDetalle from './pages/clientes/ClienteDetalle'
import EsperaPage from './pages/espera/EsperaPage'
import EsperaForm from './pages/espera/EsperaForm'
import EsperaDetalle from './pages/espera/EsperaDetalle'
import SuscripcionesPage from './pages/suscripciones/SuscripcionesPage'
import SuscripcionForm from './pages/suscripciones/SuscripcionForm'
import SuscripcionDetalle from './pages/suscripciones/SuscripcionDetalle'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <span className="font-ui font-semibold text-sm tracking-widest uppercase text-navy">
        Cargando…
      </span>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { setSession, setLoading } = useAuthStore()

  useEffect(() => {
    // Sesión existente al arrancar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Cambios de auth en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [setSession, setLoading])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="clientes/nuevo" element={<ClienteForm />} />
          <Route path="clientes/:id" element={<ClienteDetalle />} />
          <Route path="clientes/:id/editar" element={<ClienteForm />} />
          <Route path="espera" element={<EsperaPage />} />
          <Route path="espera/nueva" element={<EsperaForm />} />
          <Route path="espera/:id" element={<EsperaDetalle />} />
          <Route path="espera/:id/editar" element={<EsperaForm />} />
          <Route path="suscripciones" element={<SuscripcionesPage />} />
          <Route path="suscripciones/nueva" element={<SuscripcionForm />} />
          <Route path="suscripciones/:id" element={<SuscripcionDetalle />} />
          <Route path="suscripciones/:id/editar" element={<SuscripcionForm />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
