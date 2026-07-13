import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteSermon } from "@/lib/actions/sermons";
import { SERMON_UPLOAD_ROLES, sermonPublicUrl } from "@/lib/sermons";
import type { Sermon } from "@/lib/sermons";
import { SermonUploader } from "./sermon-uploader";

export default async function SermonsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("church_id, ministry_role")
    .eq("id", user.id)
    .single();

  const canUpload = SERMON_UPLOAD_ROLES.includes(
    (profile?.ministry_role as string) ?? "",
  );

  const { data: sermons } = await supabase
    .from("sermons")
    .select("id, title, preacher, preached_on, media_type, storage_path, description, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="flex flex-1 flex-col bg-ice">
      <header className="flex items-center justify-between border-b border-steel/20 bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-steel hover:text-navy">Dashboard</Link>
          <span className="text-steel">/</span>
          <span className="font-semibold text-navy">Sermons / Ministrations</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10">
        {canUpload && profile?.church_id && (
          <SermonUploader churchId={profile.church_id as string} />
        )}

        <div>
          <h1 className="text-2xl font-bold text-navy">Sermons / Ministrations</h1>
          <p className="mt-1 text-steel">Listen, watch, or download past messages.</p>
        </div>

        {!sermons || sermons.length === 0 ? (
          <p className="rounded-xl border border-dashed border-steel/40 bg-white/50 px-4 py-10 text-center text-steel">
            No sermons yet.
            {canUpload ? " Upload the first one above." : ""}
          </p>
        ) : (
          <ul className="space-y-4">
            {(sermons as Sermon[]).map((s) => {
              const url = sermonPublicUrl(s.storage_path);
              return (
                <li key={s.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-navy">{s.title}</h3>
                      <p className="text-sm text-steel">
                        {s.preacher || "Unknown preacher"}
                        {s.preached_on ? ` · ${s.preached_on}` : ""}
                        {` · ${s.media_type === "video" ? "Video" : "Audio"}`}
                      </p>
                    </div>
                    {canUpload && (
                      <form action={deleteSermon}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="storage_path" value={s.storage_path} />
                        <button className="text-sm font-medium text-red-600 hover:text-red-700">
                          Delete
                        </button>
                      </form>
                    )}
                  </div>

                  {s.description && (
                    <p className="mt-2 text-sm text-steel">{s.description}</p>
                  )}

                  <div className="mt-3">
                    {s.media_type === "video" ? (
                      <video controls preload="metadata" className="w-full rounded-lg bg-black">
                        <source src={url} />
                      </video>
                    ) : (
                      <audio controls preload="metadata" className="w-full">
                        <source src={url} />
                      </audio>
                    )}
                  </div>

                  <a
                    href={url}
                    download
                    className="mt-3 inline-block rounded-lg bg-ice px-4 py-2 text-sm font-medium text-deep transition-colors hover:bg-sky hover:text-white"
                  >
                    ⬇ Download
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
