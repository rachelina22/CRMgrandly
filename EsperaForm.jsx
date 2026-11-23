import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { crearEntrada, actualizarEntrada, obtenerEntrada } from '../../hooks/useEspera'
import { ChevronLeft, Save, Loader2 } from 'lucide-react'

const INTERESTS = [
  { value: 'juegos',             label: 'Juegos de mesa' },
  { value: 'lectura',            label: 'Lectura y tertulia' },
  { value: 'manualidades',       label: 'Manualidades' },
  { value: 'musica',             label: 'Música' },
  { value: 'gastronomia',        label: 'Gastronomía' },
  { value: 'teatro',             label: 'Teatro' },
  { value: 'cine',               label: 'Cine' },
  { value: 'tecnologia',         label: 'Tecnología' },
  { value: 'actividades_fisicas', label: 'Actividades físicas' },
  { value: 'conversacion',       label: 'Grupos de conversación' },
]

const schema = z.object({
  first_name:        z.string().min(1, 'Nombre requerido'),
  last_name:         z.string().min(1, 'Apellidos requeridos'),
  email:             z.string().email('Email inválido'),
  phone:             z.string().optional().nullable(),
  birth_date:        z.string().optional().nullable(),
  acquisition_source: z.string().optional().nullable(),
  interests:         z.array(z.string()).optional(),
  message:           z.string().optional().nullable(),
  status:            z.enum(['pending','contacted','approved','rejected','cancelled']),
  priority:          z.coerce.number().int().min(0).max(2),
  gdpr_consent_at:   z.string().optional().nullable(),
  comm_email:        z.boolean(),
  comm_sms:          z.boolean(),
  internal_notes:    z.string().optional().nullable(),
})

const defaults = {
  first_name: '', last_name: '', email: '', phone: '', birth_date: '',
  acquisition_source: '', interests: [], message: '',
  status: 'pending', priority: 0,
  gdpr_consent_at: '', comm_email: true, comm_sms: false, internal_notes: '',
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

export default function EsperaForm() {
  const { id }   = useParams()
  const isEdit   = !!id
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [loadingData, setLoadingData] = useState(isEdit)

  const { register, handleSubmit, reset, watch, setValue,
          formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: defaults })

  const selectedInterests = watch('interests') ?? []

  useEffect(() => {
    if (!isEdit) return
    obtenerEntrada(id)
      .then((e) => reset({
        first_name:        e.first_name        || '',
        last_name:         e.last_name         || '',
        email:             e.email             || '',
        phone:             e.phone             || '',
        birth_date:        e.birth_date        ? e.birth_date.slice(0,10) : '',
        acquisition_source: e.acquisition_source || '',
        interests:         e.interests         || [],
        message:           e.message           || '',
        status:            e.status            || 'pending',
        priority:          e.priority          ?? 0,
        gdpr_consent_at:   e.gdpr_consent_at   ? e.gdpr_consent_at.slice(0,10) : '',
        comm_email:        e.comm_email        ?? true,
        comm_sms:          e.comm_sms          ?? false,
        internal_notes:    e.internal_notes    || '',
      }))
      .catch((e) => setServerError(e.message))
      .finally(() => setLoadingData(false))
  }, [id, isEdit, reset])

  const toggleInterest = (val) => {
    const current = watch('interests') ?? []
    setValue('interests', current.includes(val) ? current.filter(v => v !== val) : [...current, val])
  }

  const onSubmit = async (values) => {
    setServerError('')
    const clean = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === '' ? null : v])
    )
    if (clean.gdpr_consent_at && !clean.gdpr_consent_at.includes('T')) {
      clean.gdpr_consent_at = new Date(clean.gdpr_consent_at).toISOString()
    }
    clean.priority = Number(clean.priority ?? 0)
    if (!clean.interests) clean.interests = []
    try {
      if (isEdit) {
        await actualizarEntrada(id, clean)
        navigate(`/espera/${id}`)
      } else {
        const nueva = await crearEntrada(clean)
        navigate(`/espera/${nueva.id}`)
      }
    } catch (e) {
      setServerError(e.message)
    }
  }

  if (loadingData) return (
    <div className="pt-24 text-center font-ui text-sm text-grey tracking-wide">Cargando…</div>
  )

  return (
    <div>
      <div className="mb-8">
        <button onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 font-ui font-semibold text-sm text-grey mb-4 hover:text-navy transition-colors">
          <ChevronLeft size={16} /> Volver
        </button>
        <div className="eyebrow">{isEdit ? 'Editar' : 'Nueva'} solicitud</div>
        <h1 className="font-display text-navy" style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', lineHeight: 1.05 }}>
          {isEdit ? 'Editar solicitud' : 'Añadir a lista de espera'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

        {/* Datos personales */}
        <div className="bg-paper rounded-card p-6" style={{ border: '2px solid #101F5C' }}>
          <h2 className="font-ui font-bold text-navy text-sm tracking-[.1em] uppercase mb-4"
              style={{ borderBottom: '1px solid #D9D2BF', paddingBottom: 10 }}>
            Datos personales
          </h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
            <Field label="Nombre"    error={errors.first_name?.message} required>
              <input {...register('first_name')} className="inp" placeholder="María" />
            </Field>
            <Field label="Apellidos" error={errors.last_name?.message}  required>
              <input {...register('last_name')} className="inp" placeholder="García López" />
            </Field>
            <Field label="Email"     error={errors.email?.message}      required>
              <input {...register('email')} type="email" className="inp" placeholder="maria@email.com" />
            </Field>
            <Field label="Teléfono"  error={errors.phone?.message}>
              <input {...register('phone')} className="inp" placeholder="+34 600 000 000" />
            </Field>
            <Field label="Fecha de nacimiento" error={errors.birth_date?.message}>
              <input {...register('birth_date')} type="date" className="inp" />
            </Field>
            <Field label="¿Cómo nos conoció?" error={errors.acquisition_source?.message}>
              <Sel reg={register('acquisition_source')}>
                <option value="">— Seleccionar —</option>
                <option value="web">Web</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="recomendacion">Recomendación</option>
                <option value="prensa">Prensa</option>
                <option value="evento">Evento</option>
                <option value="otro">Otro</option>
              </Sel>
            </Field>
          </div>
        </div>

        {/* Mensaje e intereses */}
        <div className="bg-paper rounded-card p-6" style={{ border: '2px solid #101F5C' }}>
          <h2 className="font-ui font-bold text-navy text-sm tracking-[.1em] uppercase mb-4"
              style={{ borderBottom: '1px solid #D9D2BF', paddingBottom: 10 }}>
            Intereses y mensaje
          </h2>
          <Field label="Mensaje de la solicitud" error={errors.message?.message}>
            <textarea {...register('message')} className="inp" rows={3}
                      placeholder="¿Por qué quiere unirse al club? ¿Qué espera encontrar?" style={{ resize: 'vertical' }} />
          </Field>
          <div className="mt-4">
            <p className="eyebrow" style={{ fontSize: '.68rem', marginBottom: 8 }}>Áreas de interés</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(({ value, label }) => {
                const active = selectedInterests.includes(value)
                return (
                  <button key={value} type="button" onClick={() => toggleInterest(value)}
                          className="font-ui font-semibold text-xs px-3 py-1.5 rounded-pill transition-all"
                          style={active
                            ? { background: '#101F5C', color: '#F7C531', border: '2px solid #101F5C' }
                            : { background: '#F8F1E2', color: '#1E2747', border: '2px solid #D9D2BF' }}>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Gestión interna */}
        <div className="bg-paper rounded-card p-6" style={{ border: '2px solid #101F5C' }}>
          <h2 className="font-ui font-bold text-navy text-sm tracking-[.1em] uppercase mb-4"
              style={{ borderBottom: '1px solid #D9D2BF', paddingBottom: 10 }}>
            Gestión interna
          </h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
            <Field label="Estado" error={errors.status?.message} required>
              <Sel reg={register('status')}>
                <option value="pending">En espera</option>
                <option value="contacted">Contactado</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
                <option value="cancelled">Cancelado</option>
              </Sel>
            </Field>
            <Field label="Prioridad" error={errors.priority?.message}>
              <Sel reg={register('priority')}>
                <option value={0}>Normal</option>
                <option value={1}>Alta</option>
                <option value={2}>Urgente</option>
              </Sel>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Notas internas" error={errors.internal_notes?.message}>
              <textarea {...register('internal_notes')} className="inp" rows={3}
                        placeholder="Observaciones del equipo sobre esta solicitud…" style={{ resize: 'vertical' }} />
            </Field>
          </div>
        </div>

        {/* RGPD */}
        <div className="bg-paper rounded-card p-6" style={{ border: '2px solid #101F5C' }}>
          <h2 className="font-ui font-bold text-navy text-sm tracking-[.1em] uppercase mb-4"
              style={{ borderBottom: '1px solid #D9D2BF', paddingBottom: 10 }}>
            RGPD y comunicaciones
          </h2>
          <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
            <Field label="Fecha de consentimiento RGPD" error={errors.gdpr_consent_at?.message}>
              <input {...register('gdpr_consent_at')} type="date" className="inp" />
            </Field>
          </div>
          <div className="flex gap-6 flex-wrap">
            {[{ name: 'comm_email', label: 'Email' }, { name: 'comm_sms', label: 'SMS' }].map(({ name, label }) => (
              <label key={name} className="flex items-center gap-2 font-ui font-semibold text-sm text-navy cursor-pointer select-none">
                <input type="checkbox" {...register(name)} className="w-4 h-4 accent-blue rounded" />
                {label}
              </label>
            ))}
          </div>
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
              : <><Save size={15} /> {isEdit ? 'Guardar cambios' : 'Añadir solicitud'}</>}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn">Cancelar</button>
        </div>

      </form>
    </div>
  )
}
