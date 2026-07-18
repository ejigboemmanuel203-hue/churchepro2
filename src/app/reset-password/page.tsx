import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { setNewPassword } from "@/lib/actions/auth";
import { PasswordInput } from "@/components/password-input";

export const metadata: Metadata = {
  title: "Reset password | Churchepro",
  description: "Choose a new password for your Churchepro account.",
};

export default async function ResetPasswordPage({
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
            Church<span className="text-sky">epro</span>
          </span>
        </Link>

        <h1 className="mt-6 text-2xl font-bold text-navy">Choose a new password</h1>
        <p className="mt-2 text-sm text-steel">
          Enter and confirm your new password below.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <form action={setNewPassword} className="mt-6 flex flex-col gap-4">
          <PasswordInput id="password" name="password" label="New password" minLength={6} />
          <PasswordInput id="confirm" name="confirm" label="Confirm password" minLength={6} />
          <button
            type="submit"
            className="mt-2 h-11 rounded-lg bg-sky font-medium text-white transition-colors hover:bg-deep"
          >
            Update password
          </button>
        </form>
      </div>
    </main>
  );
}
