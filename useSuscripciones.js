import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useSuscripciones({ search = '', status = '', plan_type = '' } = {}) {
  const [suscripciones, setSuscripciones] = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [total, setTotal]                 = useState(0)

  useEffect(() => {
    let cancelled = false
    async function fetch() {
      setLoading(true); setError(null)
      try {
        let q = supabase
          .from('subscriptions')
          .select(`
            *,
            customer:customers(id, first_name, last_name, email, member_type)
          `, { count: 'exact' })
          .order('created_at', { ascending: false })

        if (status)    q = q.eq('status', status)
        if (plan_type) q = q.eq('plan_type', plan_type)
        if (search) {
          // Buscar por nombre del cliente requiere filtrar post-fetch
          // Usamos ilike sobre plan_name como alternativa en servidor
          q = q.ilike('plan_name', `%${search}%`)
        }

        const { data, error: err, count } = await q
        if (err) throw err
        let result = data ?? []

        // Filtro client-side por nombre del cliente si hay búsqueda
        if (search) {
          const s = search.toLowerCase()
          result = result.filter(r =>
            r.customer?.first_name?.toLowerCase().includes(s) ||
            r.customer?.last_name?.toLowerCase().includes(s) ||
            r.customer?.email?.toLowerCase().includes(s) ||
            r.plan_name?.toLowerCase().includes(s)
          )
        }

        if (!cancelled) { setSuscripciones(result); setTotal(count ?? 0) }
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [search, status, plan_type])

  return { suscripciones, loading, error, total }
}

export async function obtenerSuscripcion(id) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`*, customer:customers(id, first_name, last_name, email, member_type, phone)`)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function crearSuscripcion(values) {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert([values])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function actualizarSuscripcion(id, values) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update(values)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function eliminarSuscripcion(id) {
  const { error } = await supabase.from('subscriptions').delete().eq('id', id)
  if (error) throw error
}

export async function pausarSuscripcion(id) {
  return actualizarSuscripcion(id, { status: 'paused', paused_at: new Date().toISOString() })
}

export async function cancelarSuscripcion(id, reason = '') {
  return actualizarSuscripcion(id, {
    status: 'cancelled',
    cancelled_at: new Date().toISOString(),
    cancellation_reason: reason || null,
  })
}

export async function reactivarSuscripcion(id) {
  return actualizarSuscripcion(id, { status: 'active', paused_at: null, cancelled_at: null, cancellation_reason: null })
}

// Suscripciones de un cliente concreto
export async function suscripcionesDeCliente(customerId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
