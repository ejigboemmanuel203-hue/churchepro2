// Demo mode configuration for read-only testing
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function demoBanner() {
  if (!DEMO_MODE) return null;
  return {
    text: "🔍 Demo Mode - Observation Only",
    subtitle: "This is a read-only preview. No changes will be saved.",
  };
}
