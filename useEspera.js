import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useEspera({ search = '', status = '', priority = '' } = {}) {
  const [espera, setEspera]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [total, setTotal]     = useState(0)

  useEffect(() => {
    let cancelled = false
    async function fetch() {
      setLoading(true)
      setError(null)
      try {
        let q = supabase
          .from('waiting_list')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })

        if (search) {
          q = q.or(
            `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
          )
        }
        if (status)   q = q.eq('status', status)
        if (priority !== '') q = q.eq('priority', Number(priority))

        const { data, error: err, count } = await q
        if (err) throw err
        if (!cancelled) {
          setEspera(data ?? [])
          setTotal(count ?? 0)
        }
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [search, status, priority])

  return { espera, loading, error, total }
}

export async function obtenerEntrada(id) {
  const { data, error } = await supabase
    .from('waiting_list')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function crearEntrada(values) {
  const { data, error } = await supabase
    .from('waiting_list')
    .insert([values])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function actualizarEntrada(id, values) {
  const { data, error } = await supabase
    .from('waiting_list')
    .update(values)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function eliminarEntrada(id) {
  const { error } = await supabase
    .from('waiting_list')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Marcar como contactado
export async function marcarContactado(id) {
  return actualizarEntrada(id, {
    status: 'contacted',
    contacted_at: new Date().toISOString(),
  })
}

// Aprobar: crea el cliente y vincula el registro
export async function aprobarEntrada(id, clienteId) {
  return actualizarEntrada(id, {
    status: 'approved',
    approved_at: new Date().toISOString(),
    converted_customer_id: clienteId ?? null,
  })
}
