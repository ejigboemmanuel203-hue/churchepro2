import { DashboardNav } from "@/components/dashboard-nav";
import { AssistantFab } from "@/components/assistant-fab";

// Wraps every dashboard page with persistent navigation:
// a left sidebar on desktop and a bottom tab bar on mobile.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <DashboardNav />
      {/* pb-16 clears the fixed mobile tab bar; bg matches the dashboard */}
      <div className="flex flex-1 flex-col bg-ice pb-16 md:pb-0">{children}</div>
      {/* Floating AI assistant button (bottom-right, on every dashboard page) */}
      <AssistantFab />
    </div>
  );
}
