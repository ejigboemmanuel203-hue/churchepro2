// Shared constants for the sermons feature.

export const SERMON_BUCKET = "sermons";

// Ministry roles allowed to upload / manage sermons.
export const SERMON_UPLOAD_ROLES = ["Media Personnel", "Pastor"];

export type SermonMediaType = "audio" | "video";

export type Sermon = {
  id: string;
  title: string;
  preacher: string | null;
  preached_on: string | null;
  media_type: SermonMediaType;
  storage_path: string;
  description: string | null;
  created_at: string;
};

// Public URL for a file in the sermons bucket.
export function sermonPublicUrl(storagePath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${SERMON_BUCKET}/${storagePath}`;
}
