import Image from "next/image";
import Link from "next/link";

// Public header shown on marketing/auth pages.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-ice bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-5">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <Image
            src="/logo.png"
            alt="Churchepro logo"
            width={40}
            height={40}
            className="h-8 w-8 shrink-0 object-contain sm:h-10 sm:w-10"
            priority
          />
          <span className="truncate text-base font-bold whitespace-nowrap text-navy sm:text-xl">
            Churche<span className="text-sky">pro</span>
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            className="whitespace-nowrap rounded-full border border-sky px-3 py-1.5 text-xs font-medium text-deep transition-colors hover:bg-sky hover:text-white sm:px-4 sm:py-2 sm:text-sm"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="whitespace-nowrap rounded-full bg-sky px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-deep sm:px-6 sm:py-2.5 sm:text-sm"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
