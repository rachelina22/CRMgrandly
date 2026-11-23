import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { crearCliente, actualizarCliente, obtenerCliente } from '../../hooks/useClientes'
import { ChevronLeft, Save, Loader2 } from 'lucide-react'

const schema = z.object({
  first_name:        z.string().min(1, 'Nombre requerido'),
  last_name:         z.string().min(1, 'Apellidos requeridos'),
  email:             z.string().email('Email inválido'),
  phone:             z.string().optional().nullable(),
  birth_date:        z.string().optional().nullable(),
  member_type:       z.enum(['standard', 'premium', 'vip', 'paused']),
  status:            z.enum(['active', 'inactive', 'pending', 'cancelled']),
  acquisition_source: z.string().optional().nullable(),
  comm_email:        z.boolean(),
  comm_sms:          z.boolean(),
  comm_post:         z.boolean(),
  gdpr_consent_at:   z.string().optional().nullable(),
  address_line:      z.string().optional().nullable(),
  address_city:      z.string().optional().nullable(),
  address_province:  z.string().optional().nullable(),
  address_postal:    z.string().optional().nullable(),
  address_country:   z.string().optional(),
  notes:             z.string().optional().nullable(),
})

const defaults = {
  first_name: '', last_name: '', email: '', phone: '', birth_date: '',
  member_type: 'standard', status: 'active', acquisition_source: '',
  comm_email: true, comm_sms: false, comm_post: true,
  gdpr_consent_at: '', address_line: '', address_city: '',
  address_province: '', address_postal: '', address_country: 'España', notes: '',
}

function Field({ label, error, children, required }) {
  return (
    <div>
      <label className="eyebrow" style={{ fontSize: '.68rem', marginBottom: 5 }}>
        {label}{required && <span style={{ color: '#E5392B' }}> *</span>}
      </label>
      {children}
      {error && (
        <p className="font-body text-xs mt-1" style={{ color: '#B3261A' }}>
          {error}
        </p>
      )}
    </div>
  )
}

function Select({ reg, children, ...props }) {
  return (
    <select
      {...reg}
      {...props}
      className="inp"
      style={{ border: '2px solid #101F5C', background: '#FFFDF7', color: '#1E2747', borderRadius: 8, padding: '0.625rem 0.875rem', width: '100%', fontFamily: 'Jost, sans-serif', fontSize: '.875rem' }}
    >
      {children}
    </select>
  )
}

export default function ClienteForm() {
  const { id }     = useParams()
  const isEdit     = !!id
  const navigate   = useNavigate()
  const [serverError, setServerError] = useState('')
  const [loadingData, setLoadingData] = useState(isEdit)

  const {
    register, handleSubmit, reset, watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: defaults })

  // Cargar datos en modo edición
  useEffect(() => {
    if (!isEdit) return
    obtenerCliente(id)
      .then((c) => {
        reset({
          first_name: c.first_name || '',
          last_name:  c.last_name  || '',
          email:      c.email      || '',
          phone:      c.phone      || '',
          birth_date: c.birth_date ? c.birth_date.slice(0, 10) : '',
          member_type: c.member_type || 'standard',
          status:      c.status      || 'active',
          acquisition_source: c.acquisition_source || '',
          comm_email: c.comm_email ?? true,
          comm_sms:   c.comm_sms   ?? false,
          comm_post:  c.comm_post  ?? true,
          gdpr_consent_at: c.gdpr_consent_at ? c.gdpr_consent_at.slice(0, 10) : '',
          address_line:     c.address_line     || '',
          address_city:     c.address_city     || '',
          address_province: c.address_province || '',
          address_postal:   c.address_postal   || '',
          address_country:  c.address_country  || 'España',
          notes: c.notes || '',
        })
      })
      .catch((e) => setServerError(e.message))
      .finally(() => setLoadingData(false))
  }, [id, isEdit, reset])

  const onSubmit = async (values) => {
    setServerError('')
    // Limpiar vacíos a null
    const clean = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === '' ? null : v])
    )
    // Añadir timestamp RGPD si hay consentimiento
    if (clean.gdpr_consent_at && !clean.gdpr_consent_at.includes('T')) {
      clean.gdpr_consent_at = new Date(clean.gdpr_consent_at).toISOString()
    }
    try {
      if (isEdit) {
        await actualizarCliente(id, clean)
        navigate(`/clientes/${id}`)
      } else {
        const nuevo = await crearCliente(clean)
        navigate(`/clientes/${nuevo.id}`)
      }
    } catch (e) {
      setServerError(e.message)
    }
  }

  if (loadingData) return (
    <div className="pt-24 text-center font-ui text-sm text-grey tracking-wide">
      Cargando datos del cliente…
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 font-ui font-semibold text-sm text-grey mb-4 hover:text-navy transition-colors"
        >
          <ChevronLeft size={16} />
          Volver
        </button>
        <div className="eyebrow">{isEdit ? 'Editar' : 'Nuevo'} cliente</div>
        <h1 className="font-display text-navy" style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', lineHeight: 1.05 }}>
          {isEdit ? 'Editar ficha' : 'Crear cliente'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

        {/* ── Datos personales ── */}
        <div className="bg-paper rounded-card p-6" style={{ border: '2px solid #101F5C' }}>
          <h2 className="font-ui font-bold text-navy text-sm tracking-[.1em] uppercase mb-4"
              style={{ borderBottom: '1px solid #D9D2BF', paddingBottom: 10 }}>
            Datos personales
          </h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
            <Field label="Nombre" error={errors.first_name?.message} required>
              <input {...register('first_name')} className="inp" placeholder="María" />
            </Field>
            <Field label="Apellidos" error={errors.last_name?.message} required>
              <input {...register('last_name')} className="inp" placeholder="García López" />
            </Field>
            <Field label="Email" error={errors.email?.message} required>
              <input {...register('email')} type="email" className="inp" placeholder="maria@email.com" />
            </Field>
            <Field label="Teléfono" error={errors.phone?.message}>
              <input {...register('phone')} className="inp" placeholder="+34 600 000 000" />
            </Field>
            <Field label="Fecha de nacimiento" error={errors.birth_date?.message}>
              <input {...register('birth_date')} type="date" className="inp" />
            </Field>
            <Field label="Fuente de captación" error={errors.acquisition_source?.message}>
              <Select reg={register('acquisition_source')}>
                <option value="">— Seleccionar —</option>
                <option value="web">Web</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="recomendacion">Recomendación</option>
                <option value="prensa">Prensa</option>
                <option value="evento">Evento</option>
                <option value="otro">Otro</option>
              </Select>
            </Field>
          </div>
        </div>

        {/* ── Membresía ── */}
        <div className="bg-paper rounded-card p-6" style={{ border: '2px solid #101F5C' }}>
          <h2 className="font-ui font-bold text-navy text-sm tracking-[.1em] uppercase mb-4"
              style={{ borderBottom: '1px solid #D9D2BF', paddingBottom: 10 }}>
            Membresía
          </h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
            <Field label="Tipo de miembro" error={errors.member_type?.message} required>
              <Select reg={register('member_type')}>
                <option value="standard">Estándar</option>
                <option value="premium">Premium</option>
                <option value="vip">VIP</option>
                <option value="paused">Pausado</option>
              </Select>
            </Field>
            <Field label="Estado" error={errors.status?.message} required>
              <Select reg={register('status')}>
                <option value="active">Activo</option>
                <option value="pending">Pendiente</option>
                <option value="inactive">Inactivo</option>
                <option value="cancelled">Cancelado</option>
              </Select>
            </Field>
          </div>
        </div>

        {/* ── Dirección ── */}
        <div className="bg-paper rounded-card p-6" style={{ border: '2px solid #101F5C' }}>
          <h2 className="font-ui font-bold text-navy text-sm tracking-[.1em] uppercase mb-4"
              style={{ borderBottom: '1px solid #D9D2BF', paddingBottom: 10 }}>
            Dirección postal
          </h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Calle y número" error={errors.address_line?.message}>
                <input {...register('address_line')} className="inp" placeholder="Calle Mayor, 12, 3º A" />
              </Field>
            </div>
            <Field label="Ciudad" error={errors.address_city?.message}>
              <input {...register('address_city')} className="inp" placeholder="Madrid" />
            </Field>
            <Field label="Provincia" error={errors.address_province?.message}>
              <input {...register('address_province')} className="inp" placeholder="Madrid" />
            </Field>
            <Field label="Código postal" error={errors.address_postal?.message}>
              <input {...register('address_postal')} className="inp" placeholder="28001" maxLength={10} />
            </Field>
            <Field label="País" error={errors.address_country?.message}>
              <input {...register('address_country')} className="inp" placeholder="España" />
            </Field>
          </div>
        </div>

        {/* ── RGPD y comunicaciones ── */}
        <div className="bg-paper rounded-card p-6" style={{ border: '2px solid #101F5C' }}>
          <h2 className="font-ui font-bold text-navy text-sm tracking-[.1em] uppercase mb-4"
              style={{ borderBottom: '1px solid #D9D2BF', paddingBottom: 10 }}>
            RGPD y preferencias de comunicación
          </h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
            <Field label="Fecha de consentimiento RGPD" error={errors.gdpr_consent_at?.message}>
              <input {...register('gdpr_consent_at')} type="date" className="inp" />
            </Field>
          </div>
          <div className="flex gap-6 flex-wrap mt-4">
            {[
              { name: 'comm_email', label: 'Email' },
              { name: 'comm_sms',   label: 'SMS'   },
              { name: 'comm_post',  label: 'Correo postal' },
            ].map(({ name, label }) => (
              <label key={name} className="flex items-center gap-2 font-ui font-semibold text-sm text-navy cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register(name)}
                  className="w-4 h-4 accent-blue rounded"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* ── Notas ── */}
        <div className="bg-paper rounded-card p-6" style={{ border: '2px solid #101F5C' }}>
          <h2 className="font-ui font-bold text-navy text-sm tracking-[.1em] uppercase mb-4"
              style={{ borderBottom: '1px solid #D9D2BF', paddingBottom: 10 }}>
            Notas internas
          </h2>
          <Field label="Notas" error={errors.notes?.message}>
            <textarea
              {...register('notes')}
              className="inp"
              placeholder="Observaciones sobre el cliente…"
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </Field>
        </div>

        {/* Error servidor */}
        {serverError && (
          <div
            className="rounded-card p-4 font-ui font-semibold text-sm"
            style={{ background: '#FCE3DF', color: '#7A1A10', border: '1.5px solid #B3261A' }}
          >
            Error de Supabase: {serverError}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 flex-wrap">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-p"
          >
            {isSubmitting
              ? <><Loader2 size={15} className="animate-spin" /> Guardando…</>
              : <><Save size={15} /> {isEdit ? 'Guardar cambios' : 'Crear cliente'}</>
            }
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn"
          >
            Cancelar
          </button>
        </div>

      </form>
    </div>
  )
}
