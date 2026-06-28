// Constants for the (anonymous) prayer-request feature.

// Ministry roles that can read a church's prayer inbox.
export const PRAYER_TEAM_ROLES = [
  "Pastor",
  "Associate Pastor",
  "Prayer Coordinator / Intercessor",
];

export const PRAYER_CATEGORIES: { key: string; label: string }[] = [
  { key: "general", label: "General" },
  { key: "healing", label: "Healing" },
  { key: "family", label: "Family" },
  { key: "finances", label: "Finances" },
  { key: "thanksgiving", label: "Thanksgiving" },
  { key: "guidance", label: "Guidance" },
  { key: "other", label: "Other" },
];

export function categoryLabel(key: string) {
  return PRAYER_CATEGORIES.find((c) => c.key === key)?.label ?? "General";
}

export type PrayerRequest = {
  id: string;
  category: string;
  body: string;
  is_read: boolean;
  created_at: string;
};
