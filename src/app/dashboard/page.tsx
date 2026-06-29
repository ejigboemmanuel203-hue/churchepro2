import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createChurch } from "@/lib/actions/church";
import { signOut } from "@/lib/actions/auth";
import { DepartmentSelect } from "./department-select";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, church_id, ministry_role, churches(name)")
    .eq("id", user.id)
    .single();

  const churchName =
    (profile?.churches as { name?: string } | null)?.name ?? null;
  const ministryRole = (profile?.ministry_role as string | null) ?? null;
  // Once a user has a church but hasn't picked their department yet,
  // prompt them to choose before showing the dashboard.
  const needsDepartment = !!churchName && !ministryRole;

  return (
    <main className="flex flex-1 flex-col bg-ice">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-steel/20 bg-white px-6 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Churchepro" width={36} height={36} className="h-9 w-9 object-contain" />
          <span className="font-bold text-navy">
            {churchName ?? (
              <>Church<span className="text-sky">epro</span></>
            )}
          </span>
        </Link>
        <form action={signOut}>
          <button className="text-sm font-medium text-steel transition-colors hover:text-navy">
            Sign out
          </button>
        </form>
      </header>

      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        {error && (
          <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        {!churchName ? (
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
            <h1 className="text-xl font-bold text-navy">
              Welcome, {profile?.full_name || "friend"}! 👋
            </h1>
            <p className="mt-2 text-steel">
              Let&apos;s set up your church. This creates a private space only
              your church can access.
            </p>
            <form action={createChurch} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                name="name"
                type="text"
                required
                placeholder="e.g. Grace Community Church"
                className="flex-1 rounded-lg border border-steel/40 px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky"
              />
              <button
                type="submit"
                className="h-11 rounded-lg bg-sky px-6 font-medium text-white transition-colors hover:bg-deep"
              >
                Create church
              </button>
            </form>
          </div>
        ) : needsDepartment ? (
          <DepartmentSelect churchName={churchName!} />
        ) : (
          <>
            <h1 className="text-2xl font-bold text-navy">{churchName}</h1>
            <p className="mt-1 text-steel">
              Signed in as {profile?.full_name || user.email} ({profile?.role}
              {ministryRole ? ` · ${ministryRole}` : ""})
            </p>

            <div className="mt-8 space-y-4">
              <FeatureCard title="Attendance" desc="Record figures per service & export the sheet." href="/dashboard/attendance" icon={ICONS.attendance} accent="bg-sky" image="/card-attendance.jpg" />
              <FeatureCard title="Follow-up" desc="Track visitors & members who need follow-up." href="/dashboard/followup" icon={ICONS.followup} accent="bg-deep" image="/login-side.png" />
              <FeatureCard title="Sermons" desc="Listen to & download sermon messages." href="/dashboard/sermons" icon={ICONS.sermons} accent="bg-steel" image="/hero-3.jpg" />
              <FeatureCard title="Prayer Requests" desc="Send an anonymous request to the prayer team." href="/dashboard/prayer" icon={ICONS.prayer} accent="bg-deep" image="/hero-2.jpg" />
              <FeatureCard title="Daily Devotion" desc="Share a daily devotion guide." soon icon={ICONS.devotion} accent="bg-steel" image="/card-devotion.jpg" />
              <FeatureCard title="Bible Quiz" desc="Test Bible knowledge with a quick quiz." href="/dashboard/quiz" icon={ICONS.quiz} accent="bg-sky" image="/card-quiz.jpg" />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

const iconClass = "h-5 w-5";
const ICONS = {
  attendance: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
      <path d="M7 3v3M17 3v3M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM4 9h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  followup: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
      <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 19c0-2.8 2.7-5 6-5s6 2.2 6 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 5.3a3 3 0 0 1 0 5.8M21 19c0-2.2-1.2-4-3-4.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  sermons: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  prayer: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
      <path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  devotion: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
      <path d="M12 6c-2-1.3-4.6-1.5-7-1v12c2.4-.5 5-.3 7 1 2-1.3 4.6-1.5 7-1V5c-2.4-.5-5-.3-7 1ZM12 6v13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  quiz: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
      <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3ZM18 14.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8.8-1.9Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function FeatureCard({
  title,
  desc,
  soon,
  href,
  icon,
  accent,
  image,
}: {
  title: string;
  desc: string;
  soon?: boolean;
  href?: string;
  icon: React.ReactNode;
  accent: string;
  image: string;
}) {
  const inner = (
    <>
      {/* Text side */}
      <div className="flex min-h-32 flex-1 flex-col justify-center p-6">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${accent}`}>
            {icon}
          </div>
          <h2 className="text-lg font-semibold text-deep">{title}</h2>
          {soon && (
            <span className="rounded-full bg-ice px-2 py-0.5 text-xs text-steel">
              Coming soon
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-steel">{desc}</p>
        {href && (
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-sky">
            Open <span aria-hidden>→</span>
          </span>
        )}
      </div>
      {/* Photo side */}
      <div className="relative w-28 shrink-0 sm:w-56">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 640px) 7rem, 14rem"
          className="object-cover"
        />
      </div>
    </>
  );

  const base =
    "group flex overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5";

  if (href) {
    return (
      <Link
        href={href}
        className={`${base} transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky/15 hover:ring-sky`}
      >
        {inner}
      </Link>
    );
  }

  return <div className={base}>{inner}</div>;
}
