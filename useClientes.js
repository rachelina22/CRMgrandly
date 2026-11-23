import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/* ── Hook: lista de clientes con filtros ── */
export function useClientes({ search = '', status = '', member_type = '' } = {}) {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [total, setTotal]       = useState(0)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let q = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (search) {
        q = q.or(
          `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
        )
      }
      if (status)      q = q.eq('status', status)
      if (member_type) q = q.eq('member_type', member_type)

      const { data, error: err, count } = await q
      if (err) throw err
      setClientes(data ?? [])
      setTotal(count ?? 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [search, status, member_type])

  useEffect(() => { fetch() }, [fetch])

  return { clientes, loading, error, total, refetch: fetch }
}

/* ── Obtener un cliente con tags e historial ── */
export async function obtenerCliente(id) {
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      customer_tags ( tag ),
      interaction_history ( * )
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

/* ── Crear cliente ── */
export async function crearCliente(values) {
  const { data, error } = await supabase
    .from('customers')
    .insert([values])
    .select()
    .single()
  if (error) throw error
  return data
}

/* ── Actualizar cliente ── */
export async function actualizarCliente(id, values) {
  const { data, error } = await supabase
    .from('customers')
    .update(values)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/* ── Eliminar cliente ── */
export async function eliminarCliente(id) {
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) throw error
}

/* ── Añadir interacción al historial ── */
export async function agregarInteraccion({ customer_id, interaction_type, description }) {
  const { data, error } = await supabase
    .from('interaction_history')
    .insert([{ customer_id, interaction_type, description }])
    .select()
    .single()
  if (error) throw error
  return data
}
