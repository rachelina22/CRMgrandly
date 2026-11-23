import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { crearSuscripcion, actualizarSuscripcion, obtenerSuscripcion } from '../../hooks/useSuscripciones'
import { supabase } from '../../lib/supabase'
import { ChevronLeft, Save, Loader2 } from 'lucide-react'

const schema = z.object({
  customer_id:       z.string().min(1, 'Selecciona un socio'),
  plan_type:         z.enum(['mensual','trimestral','semestral','anual','regalo']),
  plan_name:         z.string().optional().nullable(),
  status:            z.enum(['active','paused','cancelled','expired','pending']),
  price:             z.coerce.number().min(0, 'Precio inválido'),
  currency:          z.string().default('EUR'),
  start_date:        z.string().min(1, 'Fecha de inicio requerida'),
  end_date:          z.string().optional().nullable(),
  next_billing_date: z.string().optional().nullable(),
  payment_method:    z.enum(['domiciliacion','tarjeta','transferencia','efectivo','otro']),
  payment_reference: z.string().optional().nullable(),
  notes:             z.string().optional().nullable(),
})

const defaults = {
  customer_id: '', plan_type: 'mensual', plan_name: '', status: 'active',
  price: '', currency: 'EUR',
  start_date: new Date().toISOString().slice(0,10),
  end_date: '', next_billing_date: '',
  payment_method: 'domiciliacion', payment_reference: '', notes: '',
}

function Field({ label, error, children, required }) {
  return (
    <div>
      <label className="eyebrow" style={{ fontSize: '.68rem', marginBottom: 5 }}>
        {label}{required && <span style={{ color: '#E5392B' }}> *</span>}
      </label>
      {children}
      {error && <p className="font-body text-xs mt-1" style={{ color: '#B3261A' }}>{error}</p>}
    </div>
  )
}
function Sel({ reg, children }) {
  return (
    <select {...reg} className="inp"
            style={{ border: '2px solid #101F5C', background: '#FFFDF7', color: '#1E2747', borderRadius: 8, padding: '0.625rem 0.875rem', width: '100%', fontFamily: 'Jost, sans-serif', fontSize: '.875rem' }}>
      {children}
    </select>
  )
}

export default function SuscripcionForm() {
  const { id }   = useParams()
  const isEdit   = !!id
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [serverError,  setServerError]  = useState('')
  const [loadingData,  setLoadingData]  = useState(isEdit)
  const [clientes,     setClientes]     = useState([])
  const [loadingClients, setLoadingClients] = useState(true)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(schema), defaultValues: defaults })

  // Cargar lista de clientes para el select
  useEffect(() => {
    supabase.from('customers')
      .select('id, first_name, last_name, email')
      .eq('status', 'active')
      .order('last_name')
      .then(({ data }) => { setClientes(data ?? []); setLoadingClients(false) })
  }, [])

  // Prellenar cliente si viene por URL (?customer_id=...)
  useEffect(() => {
    const cid = searchParams.get('customer_id')
    if (cid && !isEdit) reset(v => ({ ...v, customer_id: cid }))
  }, [searchParams, isEdit, reset])

  // Cargar datos en modo edición
  useEffect(() => {
    if (!isEdit) return
    obtenerSuscripcion(id)
      .then((s) => reset({
        customer_id:       s.customer_id       || '',
        plan_type:         s.plan_type         || 'mensual',
        plan_name:         s.plan_name         || '',
        status:            s.status            || 'active',
        price:             s.price             ?? '',
        currency:          s.currency          || 'EUR',
        start_date:        s.start_date        ? s.start_date.slice(0,10) : '',
        end_date:          s.end_date          ? s.end_date.slice(0,10) : '',
        next_billing_date: s.next_billing_date ? s.next_billing_date.slice(0,10) : '',
        payment_method:    s.payment_method    || 'domiciliacion',
        payment_reference: s.payment_reference || '',
        notes:             s.notes             || '',
      }))
      .catch(e => setServerError(e.message))
      .finally(() => setLoadingData(false))
  }, [id, isEdit, reset])

  const onSubmit = async (values) => {
    setServerError('')
    const clean = Object.fromEntries(
      Object.entries(values).map(([k,v]) => [k, v === '' ? null : v])
    )
    clean.price = Number(clean.price ?? 0)
    try {
      if (isEdit) {
        await actualizarSuscripcion(id, clean)
        navigate(`/suscripciones/${id}`)
      } else {
        const nueva = await crearSuscripcion(clean)
        navigate(`/suscripciones/${nueva.id}`)
      }
    } catch (e) { setServerError(e.message) }
  }

  if (loadingData) return <div className="pt-24 text-center font-ui text-sm text-grey tracking-wide">Cargando…</div>

  return (
    <div>
      <div className="mb-8">
        <button onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 font-ui font-semibold text-sm text-grey mb-4 hover:text-navy transition-colors">
          <ChevronLeft size={16} /> Volver
        </button>
        <div className="eyebrow">{isEdit ? 'Editar' : 'Nueva'} suscripción</div>
        <h1 className="font-display text-navy" style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', lineHeight: 1.05 }}>
          {isEdit ? 'Editar suscripción' : 'Nueva suscripción'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

        {/* Socio y plan */}
        <div className="bg-paper rounded-card p-6" style={{ border: '2px solid #101F5C' }}>
          <h2 className="font-ui font-bold text-navy text-sm tracking-[.1em] uppercase mb-4"
              style={{ borderBottom: '1px solid #D9D2BF', paddingBottom: 10 }}>
            Socio y plan
          </h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
            <Field label="Socio" error={errors.customer_id?.message} required>
              <select {...register('customer_id')} disabled={loadingClients} className="inp"
                      style={{ border: '2px solid #101F5C', background: '#FFFDF7', color: '#1E2747', borderRadius: 8, padding: '0.625rem 0.875rem', width: '100%', fontFamily: 'Jost, sans-serif', fontSize: '.875rem' }}>
                <option value="">— Seleccionar socio —</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.last_name}, {c.first_name} ({c.email})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tipo de plan" error={errors.plan_type?.message} required>
              <Sel reg={register('plan_type')}>
                <option value="mensual">Mensual</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
                <option value="regalo">Regalo</option>
              </Sel>
            </Field>
            <Field label="Nombre del plan" error={errors.plan_name?.message}>
              <input {...register('plan_name')} className="inp" placeholder="Ej. Revista + Club Premium" />
            </Field>
            <Field label="Estado" error={errors.status?.message} required>
              <Sel reg={register('status')}>
                <option value="active">Activa</option>
                <option value="pending">Pendiente</option>
                <option value="paused">Pausada</option>
                <option value="cancelled">Cancelada</option>
                <option value="expired">Expirada</option>
              </Sel>
            </Field>
          </div>
        </div>

        {/* Importe y pago */}
        <div className="bg-paper rounded-card p-6" style={{ border: '2px solid #101F5C' }}>
          <h2 className="font-ui font-bold text-navy text-sm tracking-[.1em] uppercase mb-4"
              style={{ borderBottom: '1px solid #D9D2BF', paddingBottom: 10 }}>
            Importe y método de pago
          </h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
            <Field label="Precio" error={errors.price?.message} required>
              <input {...register('price')} type="number" step="0.01" min="0" className="inp" placeholder="0.00" />
            </Field>
            <Field label="Moneda" error={errors.currency?.message}>
              <Sel reg={register('currency')}>
                <option value="EUR">EUR €</option>
                <option value="USD">USD $</option>
              </Sel>
            </Field>
            <Field label="Método de pago" error={errors.payment_method?.message}>
              <Sel reg={register('payment_method')}>
                <option value="domiciliacion">Domiciliación bancaria</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="efectivo">Efectivo</option>
                <option value="otro">Otro</option>
              </Sel>
            </Field>
            <Field label="Referencia de pago" error={errors.payment_reference?.message}>
              <input {...register('payment_reference')} className="inp" placeholder="IBAN, ID Stripe, etc." />
            </Field>
          </div>
        </div>

        {/* Fechas */}
        <div className="bg-paper rounded-card p-6" style={{ border: '2px solid #101F5C' }}>
          <h2 className="font-ui font-bold text-navy text-sm tracking-[.1em] uppercase mb-4"
              style={{ borderBottom: '1px solid #D9D2BF', paddingBottom: 10 }}>
            Fechas
          </h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
            <Field label="Fecha de inicio" error={errors.start_date?.message} required>
              <input {...register('start_date')} type="date" className="inp" />
            </Field>
            <Field label="Fecha de fin (opcional)" error={errors.end_date?.message}>
              <input {...register('end_date')} type="date" className="inp" />
            </Field>
            <Field label="Próxima factura" error={errors.next_billing_date?.message}>
              <input {...register('next_billing_date')} type="date" className="inp" />
            </Field>
          </div>
        </div>

        {/* Notas */}
        <div className="bg-paper rounded-card p-6" style={{ border: '2px solid #101F5C' }}>
          <h2 className="font-ui font-bold text-navy text-sm tracking-[.1em] uppercase mb-4"
              style={{ borderBottom: '1px solid #D9D2BF', paddingBottom: 10 }}>
            Notas internas
          </h2>
          <Field label="Notas" error={errors.notes?.message}>
            <textarea {...register('notes')} className="inp" rows={3}
                      placeholder="Observaciones sobre esta suscripción…" style={{ resize: 'vertical' }} />
          </Field>
        </div>

        {serverError && (
          <div className="rounded-card p-4 font-ui font-semibold text-sm"
               style={{ background: '#FCE3DF', color: '#7A1A10', border: '1.5px solid #B3261A' }}>
            Error: {serverError}
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <button type="submit" disabled={isSubmitting} className="btn btn-p">
            {isSubmitting
              ? <><Loader2 size={15} className="animate-spin" /> Guardando…</>
              : <><Save size={15} /> {isEdit ? 'Guardar cambios' : 'Crear suscripción'}</>}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn">Cancelar</button>
        </div>

      </form>
    </div>
  )
}
