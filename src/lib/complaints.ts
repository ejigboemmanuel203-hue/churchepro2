export const COMPLAINT_KINDS: { key: string; label: string }[] = [
  { key: "suggestion", label: "Suggestion" },
  { key: "complaint", label: "Complaint" },
];

export function kindLabel(key: string) {
  return COMPLAINT_KINDS.find((c) => c.key === key)?.label ?? "Suggestion";
}

export const COMPLAINT_READER_ROLES = ["Pastor", "Associate Pastor"];

export type Complaint = {
  id: string;
  kind: string;
  body: string;
  is_read: boolean;
  created_at: string;
};
