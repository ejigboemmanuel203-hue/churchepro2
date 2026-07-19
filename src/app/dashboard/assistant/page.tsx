import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AssistantChat } from "./assistant-chat";

export default async function AssistantPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="flex flex-1 flex-col bg-ice">
      <header className="flex items-center justify-between border-b border-steel/20 bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-steel hover:text-navy">Dashboard</Link>
          <span className="text-steel">/</span>
          <span className="font-semibold text-navy">Assistant</span>
        </div>
      </header>

      <div className="mx-auto h-[calc(100svh-10rem)] w-full max-w-2xl px-6 py-6">
        <AssistantChat />
      </div>
    </main>
  );
}
