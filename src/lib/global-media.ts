// Site-wide (global) media constants — a "Featured ministrations" library
// visible to every signed-in user, uploaded by Media Personnel / Pastors
// after entering the secret passkey.

export const GLOBAL_MEDIA_BUCKET = "global-media";

export function globalMediaPublicUrl(storagePath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${GLOBAL_MEDIA_BUCKET}/${storagePath}`;
}
