import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard-nav";
import { AssistantFab } from "@/components/assistant-fab";

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
  let elevated = false;
  if (user) {
    const { data: p } = await supabase
      .from("profiles")
      .select("church_id, ministry_role")
      .eq("id", user.id)
      .maybeSingle();
    onboarded = !!p?.church_id && !!p?.ministry_role;

    if (onboarded) {
      const { data: e } = await supabase
        .from("profiles")
        .select("elevated")
        .eq("id", user.id)
        .maybeSingle();
      elevated = !!e?.elevated;
    }
  }

  if (!onboarded) {
    return <div className="flex flex-1 flex-col bg-ice">{children}</div>;
  }

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <DashboardNav elevated={elevated} />
      <div className="flex flex-1 flex-col bg-ice pb-16 md:pb-0">{children}</div>
      <AssistantFab />
    </div>
  );
}
