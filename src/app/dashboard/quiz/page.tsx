import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuizApp } from "./quiz-app";

// Open to any signed-in user on the platform (not church-scoped).
export default async function QuizPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="flex flex-1 flex-col bg-ice">
      <header className="flex items-center justify-between border-b border-steel/20 bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-steel hover:text-navy">
            Dashboard
          </Link>
          <span className="text-steel">/</span>
          <span className="font-semibold text-navy">Bible Quiz</span>
        </div>
      </header>

      <div className="w-full px-6 py-10">
        <QuizApp />
      </div>
    </main>
  );
}
