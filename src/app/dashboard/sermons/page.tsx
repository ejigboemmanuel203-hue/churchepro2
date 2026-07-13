import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteSermon } from "@/lib/actions/sermons";
import { deleteGlobalMedia } from "@/lib/actions/global-media";
import { SERMON_UPLOAD_ROLES, sermonPublicUrl } from "@/lib/sermons";
import { globalMediaPublicUrl } from "@/lib/global-media";
import { SermonUploader } from "./sermon-uploader";

type MediaRow = {
  id: string;
  title: string;
  preacher: string | null;
  preached_on: string | null;
  media_type: "audio" | "video";
  storage_path: string;
  description: string | null;
};

const SELECT =
  "id, title, preacher, preached_on, media_type, storage_path, description, created_at";

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
    .select(SELECT)
    .order("created_at", { ascending: false });

  const { data: globalMedia } = await supabase
    .from("global_media")
    .select(SELECT)
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

      <div className="mx-auto w-full max-w-3xl space-y-8 px-6 py-10">
        {canUpload && profile?.church_id && (
          <SermonUploader churchId={profile.church_id as string} />
        )}

        {/* Featured ministrations — shared across all churches */}
        {globalMedia && globalMedia.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-navy">✨ Featured ministrations</h2>
            <p className="mt-1 text-sm text-steel">
              Shared across all churches on Churchepro.
            </p>
            <ul className="mt-4 space-y-4">
              {(globalMedia as MediaRow[]).map((m) => (
                <MediaItem
                  key={m.id}
                  item={m}
                  url={globalMediaPublicUrl(m.storage_path)}
                  canManage={canUpload}
                  deleteAction={deleteGlobalMedia}
                  badge="Featured"
                />
              ))}
            </ul>
          </section>
        )}

        {/* This church's sermons */}
        <section>
          <h1 className="text-2xl font-bold text-navy">Sermons / Ministrations</h1>
          <p className="mt-1 text-steel">Listen, watch, or download past messages.</p>

          {!sermons || sermons.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-steel/40 bg-white/50 px-4 py-10 text-center text-steel">
              No sermons yet.
              {canUpload ? " Upload the first one above." : ""}
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {(sermons as MediaRow[]).map((s) => (
                <MediaItem
                  key={s.id}
                  item={s}
                  url={sermonPublicUrl(s.storage_path)}
                  canManage={canUpload}
                  deleteAction={deleteSermon}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function MediaItem({
  item,
  url,
  canManage,
  deleteAction,
  badge,
}: {
  item: MediaRow;
  url: string;
  canManage: boolean;
  deleteAction: (formData: FormData) => void;
  badge?: string;
}) {
  return (
    <li className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-navy">{item.title}</h3>
            {badge && (
              <span className="rounded-full bg-sky/15 px-2 py-0.5 text-xs font-medium text-deep">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-steel">
            {item.preacher || "Unknown preacher"}
            {item.preached_on ? ` · ${item.preached_on}` : ""}
            {` · ${item.media_type === "video" ? "Video" : "Audio"}`}
          </p>
        </div>
        {canManage && (
          <form action={deleteAction}>
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="storage_path" value={item.storage_path} />
            <button className="text-sm font-medium text-red-600 hover:text-red-700">
              Delete
            </button>
          </form>
        )}
      </div>

      {item.description && <p className="mt-2 text-sm text-steel">{item.description}</p>}

      <div className="mt-3">
        {item.media_type === "video" ? (
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
}
