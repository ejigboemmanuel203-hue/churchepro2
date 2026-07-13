"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addSermon } from "@/lib/actions/sermons";
import { addGlobalMedia } from "@/lib/actions/global-media";
import { SERMON_BUCKET } from "@/lib/sermons";
import { GLOBAL_MEDIA_BUCKET } from "@/lib/global-media";

const inputClass =
  "mt-1 w-full rounded-lg border border-steel/40 px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky";

export function SermonUploader({ churchId }: { churchId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [siteWide, setSiteWide] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    const passkey = String(data.get("passkey") ?? "");

    if (!file) return setError("Please choose an audio or video file.");
    if (!title) return setError("Please enter a title.");
    if (siteWide && !passkey) return setError("Enter the passkey to post site-wide.");

    const isVideo = file.type.startsWith("video");
    const isAudio = file.type.startsWith("audio");
    if (!isVideo && !isAudio)
      return setError("File must be an audio or video file.");

    const bucket = siteWide ? GLOBAL_MEDIA_BUCKET : SERMON_BUCKET;

    setBusy(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "bin";
      const path = siteWide
        ? `global/${crypto.randomUUID()}.${ext}`
        : `${churchId}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, { contentType: file.type, upsert: false });

      if (upErr) {
        setBusy(false);
        return setError(`Upload failed: ${upErr.message}`);
      }

      const meta = {
        title,
        preacher: String(data.get("preacher") ?? ""),
        preached_on: String(data.get("preached_on") ?? ""),
        media_type: (isVideo ? "video" : "audio") as "video" | "audio",
        storage_path: path,
        description: String(data.get("description") ?? ""),
      };
      const res = siteWide
        ? await addGlobalMedia({ ...meta, passkey })
        : await addSermon(meta);

      if (res?.error) {
        // Roll back the orphaned file if the row insert failed.
        await supabase.storage.from(bucket).remove([path]);
        setBusy(false);
        return setError(res.error);
      }

      form.reset();
      setFile(null);
      setSiteWide(false);
      setBusy(false);
      router.refresh();
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
    >
      <h2 className="text-lg font-bold text-navy">Upload a sermon</h2>
      <p className="mt-1 text-sm text-steel">
        Audio or video. Large files may take a while to upload.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-deep">
            Audio / video file
          </label>
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 w-full text-sm text-steel file:mr-3 file:rounded-lg file:border-0 file:bg-sky file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-deep"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-deep">Title *</label>
          <input name="title" required className={inputClass} placeholder="e.g. Walking in Faith" />
        </div>
        <div>
          <label className="block text-sm font-medium text-deep">Preacher</label>
          <input name="preacher" className={inputClass} placeholder="e.g. Pastor John" />
        </div>
        <div>
          <label className="block text-sm font-medium text-deep">Date preached</label>
          <input name="preached_on" type="date" className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-deep">Description</label>
          <textarea name="description" rows={2} className={inputClass} placeholder="Optional summary" />
        </div>
      </div>

      {/* Site-wide (global) option */}
      <div className="mt-5 rounded-xl bg-ice/50 p-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={siteWide}
            onChange={(e) => setSiteWide(e.target.checked)}
            className="mt-1 h-4 w-4 accent-sky"
          />
          <span className="text-sm text-deep">
            <span className="font-medium">Post site-wide (Featured ministrations)</span>
            <span className="block text-steel">
              Makes this visible to every church on Churchepro. Requires the secret
              passkey.
            </span>
          </span>
        </label>
        {siteWide && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-deep">Passkey</label>
            <input
              name="passkey"
              type="password"
              autoComplete="off"
              className={inputClass}
              placeholder="Enter the site-wide upload passkey"
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-5 h-11 rounded-lg bg-sky px-6 font-semibold text-white transition-colors hover:bg-deep disabled:opacity-60"
      >
        {busy ? "Uploading…" : siteWide ? "Upload site-wide" : "Upload sermon"}
      </button>
    </form>
  );
}
