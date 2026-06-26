// Shared follow-up definitions (safe to import on client or server).

export const CONTACT_TYPES = [
  { key: "visitor", label: "First-time visitor" },
  { key: "new_convert", label: "New convert" },
  { key: "member", label: "Member" },
  { key: "other", label: "Other" },
] as const;

export const STATUSES = [
  { key: "new", label: "New", badge: "bg-sky/15 text-sky" },
  { key: "contacted", label: "Contacted", badge: "bg-deep/15 text-deep" },
  { key: "in_progress", label: "In progress", badge: "bg-amber-100 text-amber-700" },
  { key: "completed", label: "Completed", badge: "bg-green-100 text-green-700" },
  { key: "not_interested", label: "Not interested", badge: "bg-zinc-200 text-zinc-600" },
] as const;

export const METHODS = [
  { key: "call", label: "Phone call" },
  { key: "visit", label: "Visit" },
  { key: "sms", label: "SMS" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "other", label: "Other" },
] as const;

export const typeLabel = (k: string) => CONTACT_TYPES.find((t) => t.key === k)?.label ?? k;
export const statusMeta = (k: string) => STATUSES.find((s) => s.key === k) ?? { key: k, label: k, badge: "bg-zinc-200 text-zinc-600" };
export const methodLabel = (k: string) => METHODS.find((m) => m.key === k)?.label ?? k;
