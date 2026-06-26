import Image from "next/image";
import Link from "next/link";

// Public header shown on marketing/auth pages.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-ice bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Churchepro logo"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
            priority
          />
          <span className="text-xl font-bold text-navy">
            Churche<span className="text-sky">pro</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="px-3 py-2 text-sm font-medium text-deep transition-colors hover:text-navy"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-sky px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-deep"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
