// Shared attendance definitions (safe to import on client or server).

export const CATEGORIES = [
  { key: "adult", label: "Adult" },
  { key: "campus", label: "Campus" },
  { key: "youth", label: "Youth" },
  { key: "children", label: "Children" },
  { key: "newcomers", label: "New Comers" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];

export const ACTIVITY_TYPES = [
  "Sunday Service",
  "Midweek Service",
  "Bible Study",
  "Prayer Meeting",
  "Crusade",
  "Convention",
  "Vigil",
  "Other",
] as const;

export function categoryLabel(key: string): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}
