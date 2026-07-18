import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Forgot password | Churchepro",
  description: "Reset your Churchepro password.",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center bg-ice px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Image src="/logo.png" alt="Churchepro" width={40} height={40} className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-navy">
            Church<span className="text-sky">epro</span>
          </span>
        </Link>

        <h1 className="mt-6 text-2xl font-bold text-navy">Forgot your password?</h1>

        {sent ? (
          <>
            <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              If an account exists for that email, we&apos;ve sent a password reset
              link. Check your inbox (and spam folder).
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm font-medium text-sky hover:underline"
            >
              ← Back to sign in
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-steel">
              Enter your email and we&apos;ll send you a link to reset it.
            </p>
            <form action={requestPasswordReset} className="mt-6 flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-deep">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 w-full rounded-lg border border-steel/40 px-3 py-2 text-navy outline-none focus:border-sky focus:ring-1 focus:ring-sky"
                />
              </div>
              <button
                type="submit"
                className="h-11 rounded-lg bg-sky font-medium text-white transition-colors hover:bg-deep"
              >
                Send reset link
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-steel">
              Remembered it?{" "}
              <Link href="/login" className="font-medium text-sky hover:underline">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
