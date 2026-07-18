"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveAvatarUrl, updatePassword } from "@/lib/actions/account";
import { signOut } from "@/lib/actions/auth";
import { MISSION, VISION } from "@/lib/about";

type View = "menu" | "password" | "about" | "invite" | "contact";

const CONTACT_EMAIL = "hello@churchepro.com";

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
  const [view, setView] = useState<View>("menu");
  const [avatar, setAvatar] = useState<string | null>(avatarUrl);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok?: boolean; error?: string | null } | null>(null);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => setOrigin(window.location.origin), []);

  const initials = (name || email || "?").trim().charAt(0).toUpperCase();

  const inviteLink = `${origin}/signup`;
  const inviteMessage = `Join me on Churchepro — a simple way to manage your church all in one place. Sign up here: ${inviteLink}`;

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — user can still select the text */
    }
  }

  function close() {
    setOpen(false);
    setView("menu");
    setPwMsg(null);
  }

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

  const title =
    view === "password"
      ? "Change password"
      : view === "about"
        ? "About Churchepro"
        : view === "invite"
          ? "Invite a friend"
          : view === "contact"
            ? "Contact us"
            : "Account";

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
          <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={close} />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-steel/15 p-5">
              {view !== "menu" && (
                <button
                  onClick={() => setView("menu")}
                  aria-label="Back"
                  className="text-xl leading-none text-steel hover:text-navy"
                >
                  ‹
                </button>
              )}
              <h2 className="flex-1 font-display text-xl font-bold text-navy">{title}</h2>
              <button
                onClick={close}
                aria-label="Close"
                className="text-2xl leading-none text-steel hover:text-navy"
              >
                ×
              </button>
            </div>

            {/* ---- MENU ---- */}
            {view === "menu" && (
              <div className="flex flex-1 flex-col">
                <div className="flex items-center gap-4 p-5">
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
                </div>

                <nav className="border-t border-steel/15">
                  <MenuItem label="Change password" onClick={() => setView("password")} />
                  <MenuItem label="About Churchepro" onClick={() => setView("about")} />
                  <MenuItem label="Contact us" onClick={() => setView("contact")} />
                  <MenuItem label="Invite a friend" onClick={() => setView("invite")} />
                  <form action={signOut}>
                    <button className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-red-600 transition-colors hover:bg-red-50">
                      <span>Sign out</span>
                      <span aria-hidden>↪</span>
                    </button>
                  </form>
                </nav>
              </div>
            )}

            {/* ---- CHANGE PASSWORD ---- */}
            {view === "password" && (
              <div className="p-5">
                {pwMsg?.ok && (
                  <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                    Password updated.
                  </p>
                )}
                {pwMsg?.error && (
                  <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {pwMsg.error}
                  </p>
                )}
                <form onSubmit={handlePassword} className="space-y-3">
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
              </div>
            )}

            {/* ---- ABOUT ---- */}
            {view === "about" && (
              <div className="space-y-4 p-5">
                <div className="rounded-xl bg-ice/60 p-4">
                  <p className="text-sm font-semibold text-navy">Our Mission</p>
                  <p className="mt-1 text-sm leading-relaxed text-steel">{MISSION}</p>
                </div>
                <div className="rounded-xl bg-ice/60 p-4">
                  <p className="text-sm font-semibold text-navy">Our Vision</p>
                  <p className="mt-1 text-sm leading-relaxed text-steel">{VISION}</p>
                </div>
              </div>
            )}

            {/* ---- INVITE A FRIEND ---- */}
            {view === "invite" && (
              <div className="space-y-4 p-5">
                <p className="text-sm text-steel">
                  Invite a friend to Churchepro. Share this link and they can
                  create their own account.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={inviteLink}
                    onFocus={(e) => e.currentTarget.select()}
                    className="min-w-0 flex-1 rounded-lg border border-steel/40 px-3 py-2 text-sm text-navy outline-none"
                  />
                  <button
                    onClick={copyInvite}
                    className="h-10 shrink-0 rounded-lg bg-sky px-4 text-sm font-medium text-white transition-colors hover:bg-deep"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(inviteMessage)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 items-center justify-center rounded-lg bg-ice text-sm font-medium text-deep transition-colors hover:bg-sky hover:text-white"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent("Join me on Churchepro")}&body=${encodeURIComponent(inviteMessage)}`}
                    className="flex h-10 items-center justify-center rounded-lg bg-ice text-sm font-medium text-deep transition-colors hover:bg-sky hover:text-white"
                  >
                    Email
                  </a>
                </div>
              </div>
            )}

            {/* ---- CONTACT US ---- */}
            {view === "contact" && (
              <div className="space-y-4 p-5">
                <p className="text-sm text-steel">
                  Questions, feedback, or need a hand? We&apos;d love to hear
                  from you.
                </p>
                <div className="rounded-xl bg-ice/60 p-4">
                  <p className="text-sm font-semibold text-navy">Email us</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="mt-1 block text-sm font-medium text-sky hover:underline"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Churchepro support")}`}
                  className="flex h-11 items-center justify-center rounded-lg bg-sky font-medium text-white transition-colors hover:bg-deep"
                >
                  Send us a message
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between px-5 py-4 text-left text-navy transition-colors hover:bg-ice/50"
    >
      <span className="font-medium">{label}</span>
      <span className="text-steel">›</span>
    </button>
  );
}
