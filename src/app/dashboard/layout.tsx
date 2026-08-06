import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard-nav";
import { AssistantFab } from "@/components/assistant-fab";

// Wraps dashboard pages with persistent navigation (desktop sidebar +
// mobile bottom tab bar) and the assistant button — but only once the user
// has finished onboarding (joined a church and picked a department). During
// onboarding the nav is hidden so it doesn't distract or confuse.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let onboarded = false;
  if (user) {
    const { data: p } = await supabase
      .from("profiles")
      .select("church_id, ministry_role")
      .eq("id", user.id)
      .maybeSingle();
    onboarded = !!p?.church_id && !!p?.ministry_role;
  }

  if (!onboarded) {
    return <div className="flex flex-1 flex-col bg-ice">{children}</div>;
  }

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <DashboardNav />
      {/* pb-16 clears the fixed mobile tab bar; bg matches the dashboard */}
      <div className="flex flex-1 flex-col bg-ice pb-16 md:pb-0">{children}</div>
      <AssistantFab />
    </div>
  );
}
