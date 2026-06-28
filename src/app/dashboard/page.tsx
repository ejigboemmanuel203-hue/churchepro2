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
              <>Churche<span className="text-sky">pro</span></>
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

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard title="Attendance" desc="Record figures per service & export the sheet." href="/dashboard/attendance" />
              <FeatureCard title="Follow-up" desc="Track visitors & members who need follow-up." href="/dashboard/followup" />
              <FeatureCard title="Sermons" desc="Listen to & download sermon messages." href="/dashboard/sermons" />
              <FeatureCard title="Daily Devotion" desc="Share a daily devotion guide." soon />
              <FeatureCard title="AI Bible Quiz" desc="Test Bible knowledge with a quick quiz." href="/dashboard/quiz" />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  desc,
  soon,
  href,
}: {
  title: string;
  desc: string;
  soon?: boolean;
  href?: string;
}) {
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-deep">{title}</h2>
        {soon && (
          <span className="rounded-full bg-ice px-2 py-0.5 text-xs text-steel">
            Coming soon
          </span>
        )}
        {href && <span className="text-sky">→</span>}
      </div>
      <p className="mt-2 text-sm text-steel">{desc}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-colors hover:ring-sky"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">{inner}</div>
  );
}
