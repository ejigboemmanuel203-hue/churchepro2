import { DEMO_MODE } from "@/lib/demo-mode";

export function DemoBanner() {
  if (!DEMO_MODE) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
      <p className="text-center text-sm font-medium text-amber-900">
        🔍 <strong>Demo Mode</strong> — This is a read-only preview for observation only. No changes will be saved.
      </p>
    </div>
  );
}
