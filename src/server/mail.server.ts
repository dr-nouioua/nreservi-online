import nodemailer from "nodemailer";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { mailLog, mailSettings } from "../../db/schema.js";

export type MailConfig = typeof mailSettings.$inferSelect;

export async function getMailConfig(): Promise<MailConfig | null> {
  const [row] = await db.select().from(mailSettings).where(eq(mailSettings.id, 1));
  return row ?? null;
}

export function isMailUsable(cfg: MailConfig | null): boolean {
  return Boolean(cfg && cfg.enabled && cfg.smtpHost && cfg.smtpUser && cfg.smtpPass && cfg.fromEmail);
}

/**
 * Sends an email through the super-admin's SMTP settings and journals the
 * attempt in mail_log. Never throws — callers get { ok, error }.
 */
export async function sendMail(opts: {
  to: string
  subject: string
  html: string
  kind?: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const cfg = await getMailConfig();

  const skip = !isMailUsable(cfg) ? "Serveur mail non configuré ou désactivé." : null;
  if (skip) {
    await log(opts.to, opts.subject, opts.kind ?? "custom", "skipped", skip!);
    return { ok: false, error: skip! };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: cfg!.smtpHost,
      port: cfg!.smtpPort,
      secure: cfg!.smtpSecure,
      auth: { user: cfg!.smtpUser, pass: cfg!.smtpPass },
    });
    await transporter.sendMail({
      from: `"${cfg!.fromName}" <${cfg!.fromEmail}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    await log(opts.to, opts.subject, opts.kind ?? "custom", "sent", null);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await log(opts.to, opts.subject, opts.kind ?? "custom", "failed", message);
    return { ok: false, error: message };
  }
}

async function log(to: string, subject: string, kind: string, status: string, error: string | null) {
  await db.insert(mailLog).values({ toEmail: to, subject, kind, status, error });
}

/** Minimal branded FR email shell — table layout for maximal client compatibility. */
export function brandedEmail(title: string, paragraphs: string[], cta?: { label: string; url: string }): string {
  const body = paragraphs
    .map((p) => `<tr><td style="padding:0 32px 14px;font-size:14px;line-height:1.6;color:#44403c;">${p}</td></tr>`)
    .join("");
  const button = cta
    ? `<tr><td style="padding:8px 32px 28px;"><a href="${cta.url}" style="display:inline-block;background:#1c1917;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 22px;border-radius:8px;">${cta.label}</a></td></tr>`
    : "<tr><td style=\"padding:0 32px 28px;\">&nbsp;</td></tr>";
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f5f5f4;padding:28px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e7e5e4;">
  <tr><td style="padding:24px 32px 6px;"><img src="https://nreservi.online/brand/nreservi-logo.png" alt="nreservi.online" height="26" style="display:block;" /></td></tr>
  <tr><td style="padding:18px 32px 10px;font-size:19px;font-weight:700;color:#1c1917;">${title}</td></tr>
  ${body}
  ${button}
  <tr><td style="padding:14px 32px;border-top:1px solid #f5f5f4;font-size:11px;color:#a8a29e;">nreservi.online — la réservation de table en ligne, simple et accessible.</td></tr>
</table></body></html>`;
}
