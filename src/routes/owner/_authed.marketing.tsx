import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Send, Plus } from 'lucide-react'
import { getMarketing, addMarketingTemplate, toggleMarketingRule, addMarketingRule, runMarketingRuleNow } from '../../server/owner.functions'

export const Route = createFileRoute('/owner/_authed/marketing')({
  loader: () => getMarketing(),
  component: MarketingPage,
})

function MarketingPage() {
  const initial = Route.useLoaderData()
  const [data, setData] = useState(initial)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateBody, setNewTemplateBody] = useState('')
  const [sendingRule, setSendingRule] = useState<number | null>(null)

  async function refresh() {
    setData(await getMarketing())
  }

  async function createTemplate(e: React.FormEvent) {
    e.preventDefault()
    await addMarketingTemplate({ data: { name: newTemplateName, body: newTemplateBody } })
    setNewTemplateName('')
    setNewTemplateBody('')
    refresh()
  }

  async function toggleRule(id: number, active: boolean) {
    await toggleMarketingRule({ data: { id, active } })
    refresh()
  }

  async function runRule(id: number) {
    setSendingRule(id)
    try {
      await runMarketingRuleNow({ data: { ruleId: id } })
      await refresh()
    } finally {
      setSendingRule(null)
    }
  }

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-stone-900">Marketing automation</h1>
      <p className="text-stone-500 text-sm mt-1">Retarget customers via WhatsApp based on behavior segments.</p>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
        {[
          { label: 'Sent', value: data.perf.sent },
          { label: 'Delivered', value: data.perf.delivered },
          { label: 'Read', value: data.perf.read },
          { label: 'Booked as result', value: data.perf.booked },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-4">
            <p className="text-xs text-stone-500">{s.label}</p>
            <p className="text-xl font-bold text-stone-900">{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-stone-900 mt-8 mb-3">Automation rules</h2>
      <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
        {data.rules.map((rule) => {
          const segment = data.segments.find((s) => s.id === rule.segmentId)
          const template = data.templates.find((t) => t.id === rule.templateId)
          return (
            <div key={rule.id} className="p-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-sm font-medium text-stone-800">
                  {segment?.name} <span className="text-stone-400">→</span> {template?.name}
                </p>
                <p className="text-xs text-stone-400">Trigger: {segment?.kind.replace('_', ' ')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => runRule(rule.id)}
                  disabled={sendingRule === rule.id}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> {sendingRule === rule.id ? 'Sending...' : 'Run now'}
                </button>
                <button
                  onClick={() => toggleRule(rule.id, !rule.active)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${rule.active ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}
                >
                  {rule.active ? 'Active' : 'Paused'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <h2 className="text-lg font-semibold text-stone-900 mt-8 mb-3">Templates</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.templates.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-stone-200 p-4">
            <p className="text-sm font-medium text-stone-800">{t.name}</p>
            <p className="text-xs text-stone-500 mt-1">{t.body}</p>
          </div>
        ))}
      </div>

      <form onSubmit={createTemplate} className="mt-4 bg-white rounded-xl border border-stone-200 p-4 space-y-2 max-w-lg">
        <p className="text-sm font-medium text-stone-700 flex items-center gap-1"><Plus className="w-4 h-4" /> New template</p>
        <input required placeholder="Template name" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm" />
        <textarea required placeholder="Hi {{name}}, ... {{last_visit_date}} ... {{offer_code}}" value={newTemplateBody} onChange={(e) => setNewTemplateBody(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm" />
        <button className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-sm">Save template</button>
      </form>

      <h2 className="text-lg font-semibold text-stone-900 mt-8 mb-3">Recent sends</h2>
      <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
        {data.logs.map(({ log, customer, template }) => (
          <div key={log.id} className="p-3 flex items-center justify-between text-sm">
            <span>{customer.name ?? customer.phone} &middot; {template?.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 capitalize">{log.status}</span>
          </div>
        ))}
        {data.logs.length === 0 && <p className="p-4 text-sm text-stone-400">No campaigns sent yet.</p>}
      </div>
    </div>
  )
}
