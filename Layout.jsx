import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      {/* Raya de toldo fija arriba — igual que grandly.es */}
      <div className="stripe-bar fixed top-0 left-0 right-0 z-50" style={{ height: 6 }} />
      <Sidebar />
      <main className="flex-1 min-w-0" style={{ marginLeft: 224, paddingTop: 6 }}>
        <div className="max-w-5xl mx-auto px-8 py-9">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
