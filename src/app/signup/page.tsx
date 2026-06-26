import Image from "next/image";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";

const inputClass =
  "mt-1 w-full rounded-lg border border-steel/40 px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center bg-ice px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Image src="/logo.png" alt="Churchepro" width={40} height={40} className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-navy">
            Churche<span className="text-sky">pro</span>
          </span>
        </Link>

        <h1 className="mt-6 text-2xl font-bold text-navy">Create your account</h1>
        <p className="mt-2 text-sm text-steel">Start managing your church in minutes.</p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <form action={signUp} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-deep">Full name</label>
            <input id="full_name" name="full_name" type="text" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-deep">Email</label>
            <input id="email" name="email" type="email" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-deep">Password</label>
            <input id="password" name="password" type="password" required minLength={6} className={inputClass} />
          </div>
          <button
            type="submit"
            className="mt-2 h-11 rounded-lg bg-sky font-medium text-white transition-colors hover:bg-deep"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-steel">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-sky hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
