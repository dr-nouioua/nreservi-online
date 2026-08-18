import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { onboardRestaurant } from '../../server/admin.functions'

export const Route = createFileRoute('/admin/_authed/onboard')({
  component: OnboardPage,
})

function OnboardPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    slug: '',
    city: '',
    cuisine: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    whatsappNumber: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerName: '',
  })
  const [submitting, setSubmitting] = useState(false)

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value, ...(key === 'name' && !f.slug ? { slug: slugify(value) } : {}) }))
  }

  function slugify(v: string) {
    return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onboardRestaurant({ data: form })
      navigate({ to: '/admin' })
    } finally {
      setSubmitting(false)
    }
  }

  const fields: [keyof typeof form, string][] = [
    ['name', 'Restaurant name'],
    ['slug', 'URL slug'],
    ['city', 'City'],
    ['cuisine', 'Cuisine'],
    ['address', 'Address'],
    ['contactEmail', 'Contact email'],
    ['contactPhone', 'Contact phone'],
    ['whatsappNumber', 'WhatsApp Business number'],
    ['ownerName', 'Owner name'],
    ['ownerEmail', 'Owner login email'],
    ['ownerPassword', 'Owner login password'],
  ]

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-stone-900">Onboard a restaurant</h1>
      <form onSubmit={submit} className="mt-6 bg-white rounded-xl border border-stone-200 p-6 space-y-3">
        {fields.map(([key, label]) => (
          <div key={key}>
            <label className="text-xs text-stone-500">{label}</label>
            <input
              required={key !== 'whatsappNumber'}
              type={key === 'ownerPassword' ? 'password' : 'text'}
              value={form[key]}
              onChange={(e) => update(key, e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 text-sm"
            />
          </div>
        ))}
        <button disabled={submitting} className="w-full py-2.5 rounded-lg bg-stone-900 text-white text-sm font-medium disabled:opacity-50">
          {submitting ? 'Creating...' : 'Create restaurant + owner account'}
        </button>
      </form>
    </div>
  )
}
