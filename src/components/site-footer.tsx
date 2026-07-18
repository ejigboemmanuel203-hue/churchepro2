import Image from "next/image";
import Link from "next/link";

// Public site footer with product, legal and contact links.
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy text-ice">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Churchepro" width={36} height={36} className="h-9 w-9 object-contain" />
            <span className="text-lg font-bold text-white">
              Church<span className="text-sky">epro</span>
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-ice/70">
            Simple, all-in-one tools to help every church care for its people.
          </p>
        </div>

        {/* Product */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">Product</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/signup" className="text-ice/70 hover:text-white">Get started</Link></li>
            <li><Link href="/login" className="text-ice/70 hover:text-white">Sign in</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">Legal</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/privacy" className="text-ice/70 hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-ice/70 hover:text-white">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">Contact</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href="mailto:hello@churchepro.com" className="text-ice/70 hover:text-white">
                hello@churchepro.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-sm text-ice/60">
        © {year} Churchepro. All rights reserved.
      </div>
    </footer>
  );
}
