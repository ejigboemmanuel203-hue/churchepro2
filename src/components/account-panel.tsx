"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveAvatarUrl, updatePassword } from "@/lib/actions/account";
import { signOut } from "@/lib/actions/auth";
import { MISSION, VISION } from "@/lib/about";

const inputClass =
  "mt-1 w-full rounded-lg border border-steel/40 px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky";

export function AccountPanel({
  name,
  email,
  avatarUrl,
  userId,
}: {
  name: string;
  email: string;
  avatarUrl: string | null;
  userId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(avatarUrl);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok?: boolean; error?: string | null } | null>(null);

  const initials = (name || email || "?").trim().charAt(0).toUpperCase();

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image")) return alert("Please choose an image file.");

    setAvatarBusy(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) {
        setAvatarBusy(false);
        return alert(`Upload failed: ${error.message}`);
      }
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const res = await saveAvatarUrl(data.publicUrl);
      if (res?.error) {
        setAvatarBusy(false);
        return alert(res.error);
      }
      setAvatar(data.publicUrl);
      setAvatarBusy(false);
      router.refresh();
    } catch {
      setAvatarBusy(false);
      alert("Something went wrong uploading your picture.");
    }
  }

  async function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwBusy(true);
    setPwMsg(null);
    const form = e.currentTarget;
    const res = await updatePassword(new FormData(form));
    setPwBusy(false);
    setPwMsg(res);
    if (res?.ok) form.reset();
  }

  const AvatarCircle = ({ size }: { size: string }) =>
    avatar ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatar} alt="" className={`${size} rounded-full object-cover`} />
    ) : (
      <span className={`${size} flex items-center justify-center rounded-full bg-sky font-semibold text-white`}>
        {initials}
      </span>
    );

  return (
    <>
      {/* Avatar button (top-right of header) */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open account menu"
        className="rounded-full ring-2 ring-transparent transition hover:ring-sky/40"
      >
        <AvatarCircle size="h-9 w-9 text-sm" />
      </button>

      {/* Slide-out panel */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-steel/15 p-5">
              <h2 className="font-display text-xl font-bold text-navy">Account</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-2xl leading-none text-steel hover:text-navy"
              >
                ×
              </button>
            </div>

            <div className="flex-1 space-y-8 p-5">
              {/* Profile picture */}
              <section className="flex items-center gap-4">
                <AvatarCircle size="h-16 w-16 text-xl" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-navy">{name || "Member"}</p>
                  <p className="truncate text-sm text-steel">{email}</p>
                  <label className="mt-2 inline-block cursor-pointer text-sm font-medium text-sky hover:text-deep">
                    {avatarBusy ? "Uploading…" : "Change photo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatar}
                      disabled={avatarBusy}
                      className="hidden"
                    />
                  </label>
                </div>
              </section>

              {/* Change password */}
              <section>
                <h3 className="font-semibold text-deep">Change password</h3>
                {pwMsg?.ok && (
                  <p className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                    Password updated.
                  </p>
                )}
                {pwMsg?.error && (
                  <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {pwMsg.error}
                  </p>
                )}
                <form onSubmit={handlePassword} className="mt-3 space-y-3">
                  <div>
                    <label className="block text-sm text-steel">New password</label>
                    <input name="password" type="password" required minLength={6} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm text-steel">Confirm password</label>
                    <input name="confirm" type="password" required minLength={6} className={inputClass} />
                  </div>
                  <button
                    type="submit"
                    disabled={pwBusy}
                    className="h-10 w-full rounded-lg bg-sky font-medium text-white transition-colors hover:bg-deep disabled:opacity-60"
                  >
                    {pwBusy ? "Saving…" : "Update password"}
                  </button>
                </form>
              </section>

              {/* About */}
              <section>
                <h3 className="font-semibold text-deep">About Churchepro</h3>
                <div className="mt-3 space-y-4">
                  <div className="rounded-xl bg-ice/60 p-4">
                    <p className="text-sm font-semibold text-navy">Our Mission</p>
                    <p className="mt-1 text-sm leading-relaxed text-steel">{MISSION}</p>
                  </div>
                  <div className="rounded-xl bg-ice/60 p-4">
                    <p className="text-sm font-semibold text-navy">Our Vision</p>
                    <p className="mt-1 text-sm leading-relaxed text-steel">{VISION}</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Sign out */}
            <div className="border-t border-steel/15 p-5">
              <form action={signOut}>
                <button className="h-11 w-full rounded-lg border border-red-200 font-medium text-red-600 transition-colors hover:bg-red-50">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
