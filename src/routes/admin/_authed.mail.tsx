import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Mail, Save, Send } from 'lucide-react'
import { getMailSettings, saveMailSettings, sendTestEmail, listMailLog } from '../../server/admin.functions'

export const Route = createFileRoute('/admin/_authed/mail')({
  loader: () => Promise.all([getMailSettings(), listMailLog()]),
  component: MailServerPage,
})

type Settings = Awaited<ReturnType<typeof getMailSettings>>
type LogRow = Awaited<ReturnType<typeof listMailLog>>[number]

function MailServerPage() {
  const [initial, log] = Route.useLoaderData()
  const [cfg, setCfg] = useState<Settings>(initial)
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [testTo, setTestTo] = useState('')
  const [testMessage, setTestMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const result = await saveMailSettings({
      data: {
        enabled: cfg.enabled,
        smtpHost: cfg.smtpHost,
        smtpPort: cfg.smtpPort,
        smtpSecure: cfg.smtpSecure,
        smtpUser: cfg.smtpUser,
        smtpPass: password,
        fromName: cfg.fromName,
        fromEmail: cfg.fromEmail,
      },
    })
    setSaving(false)
    if ('error' in result && result.error) {
      setMessage(result.error)
      return
    }
    setPassword('')
    setMessage('Configuration enregistrée.')
  }

  async function sendTest() {
    const result = await sendTestEmail({ data: { to: testTo } })
    if ('error' in result && result.error) {
      setTestMessage(result.error)
      return
    }
    setTestMessage("E-mail de test envoyé — vérifiez la boîte de réception (et les spams).")
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-sm font-medium text-lime-300">Administration</p>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Serveur d'e-mails</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Configurez une passerelle SMTP (ex. Hostinger : smtp.hostinger.com, port 465) — utilisée pour notifier
          les restaurants (bienvenue, abonnement, expiration) et vos envois manuels.
        </p>
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
          <strong>Identifiants :</strong> créez une boîte mail dédiée dans hPanel → Emails (ex. notifications@nreservi.online),
          définissez son mot de passe, puis utilisez <strong>l'adresse complète</strong> comme utilisateur SMTP.
          Erreur « 535 auth failed » = mauvais identifiant ou mot de passe de la boîte mail.
        </div>
      </div>

      <form onSubmit={save} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 space-y-4 shadow-sm">
        <label className="inline-flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={cfg.enabled} onChange={(e) => setCfg({ ...cfg, enabled: e.target.checked })} className="peer sr-only" />
          <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${cfg.enabled ? 'bg-lime-500' : 'bg-stone-300 dark:bg-stone-600'}`}>
            <span className={`absolute h-5 w-5 rounded-full bg-white shadow transition-all ${cfg.enabled ? 'left-[22px]' : 'left-0.5'}`} />
          </span>
          <span className="text-sm font-medium text-stone-800 dark:text-stone-200">Serveur activé</span>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-stone-500 dark:text-stone-400">Hôte SMTP</label>
            <input value={cfg.smtpHost} onChange={(e) => setCfg({ ...cfg, smtpHost: e.target.value })} placeholder="smtp.hostinger.com" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-stone-500 dark:text-stone-400">Port</label>
              <input type="number" value={cfg.smtpPort} onChange={(e) => setCfg({ ...cfg, smtpPort: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700" />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-500 dark:text-stone-400">Sécurité</label>
              <select value={cfg.smtpSecure ? 'ssl' : 'tls'} onChange={(e) => setCfg({ ...cfg, smtpSecure: e.target.value === 'ssl' })} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700">
                <option value="tls">STARTTLS (587)</option>
                <option value="ssl">SSL (465)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 dark:text-stone-400">Utilisateur</label>
            <input value={cfg.smtpUser} onChange={(e) => setCfg({ ...cfg, smtpUser: e.target.value })} placeholder="notifications@nreservi.online" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700" />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Mot de passe {initial.hasPassword && <span className="text-lime-600 dark:text-lime-400">(enregistré)</span>}
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={initial.hasPassword ? 'Laisser vide pour conserver' : 'Mot de passe SMTP'} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700" />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 dark:text-stone-400">Nom de l'expéditeur</label>
            <input value={cfg.fromName} onChange={(e) => setCfg({ ...cfg, fromName: e.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700" />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 dark:text-stone-400">E-mail expéditeur</label>
            <input type="email" value={cfg.fromEmail} onChange={(e) => setCfg({ ...cfg, fromEmail: e.target.value })} placeholder="notifications@nreservi.online" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700" />
          </div>
        </div>

        {message && (
          <p className={`text-sm ${message === 'Configuration enregistrée.' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{message}</p>
        )}
        <button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">
          <Save className="h-4 w-4" /> {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>

      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 space-y-3 shadow-sm">
        <p className="font-semibold text-stone-900 flex items-center gap-2 dark:text-stone-100"><Send className="h-4 w-4" /> Tester l'envoi</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="adresse@exemple.com" className="flex-1 rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700" />
          <button onClick={sendTest} disabled={!testTo} className="rounded-lg bg-stone-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">Envoyer le test</button>
        </div>
        {testMessage && <p className={`text-sm ${testMessage.startsWith('E-mail de test') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{testMessage}</p>}
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 shadow-sm">
        <p className="font-semibold text-stone-900 flex items-center gap-2 dark:text-stone-100"><Mail className="h-4 w-4" /> Journal d'envoi (30 derniers)</p>
        {log.length === 0 ? (
          <p className="mt-3 text-sm text-stone-400">Aucun e-mail envoyé pour l'instant.</p>
        ) : (
          <ul className="mt-3 divide-y divide-stone-100 dark:divide-stone-800">
            {log.map((row: LogRow) => (
              <li key={row.id} className="flex items-start justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-stone-800 dark:text-stone-200">{row.subject}</p>
                  <p className="text-xs text-stone-400">{row.toEmail} · {new Date(row.createdAt ?? '').toLocaleString('fr-FR')}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                  row.status === 'sent' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                  : row.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'
                  : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
                }`}>
                  {row.status === 'sent' ? 'Envoyé' : row.status === 'failed' ? 'Échec' : 'Ignoré'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
