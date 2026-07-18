import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Terms of Service | Churchepro",
  description: "The terms that govern your use of Churchepro.",
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-display text-3xl font-bold text-navy">Terms of Service</h1>
          <p className="mt-2 text-sm text-steel">Last updated: {new Date().getFullYear()}</p>

          <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            This is a starting template and not legal advice. Please have it
            reviewed by a qualified professional before you process payments or
            go to production.
          </div>

          <div className="mt-8 space-y-8 text-steel leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-navy">1. Acceptance of terms</h2>
              <p className="mt-2">
                By creating an account or using Churchepro, you agree to these
                Terms of Service. If you do not agree, please do not use the
                service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-navy">2. Your account</h2>
              <p className="mt-2">
                You are responsible for keeping your login credentials secure and
                for all activity under your account. You must provide accurate
                information and be authorised to manage the church you register.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-navy">3. Acceptable use</h2>
              <p className="mt-2">
                You agree not to misuse the service, upload unlawful content, or
                attempt to access data belonging to other churches. Media you
                upload must be content you have the right to share.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-navy">4. Content ownership</h2>
              <p className="mt-2">
                Your church retains ownership of the content it adds. You grant us
                the limited rights needed to store and display that content within
                the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-navy">5. Availability</h2>
              <p className="mt-2">
                The service is provided &ldquo;as is&rdquo; while in early access.
                We may change or discontinue features, and we do not guarantee
                uninterrupted availability.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-navy">6. Changes to these terms</h2>
              <p className="mt-2">
                We may update these terms from time to time. Continued use after
                changes means you accept the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-navy">7. Contact</h2>
              <p className="mt-2">
                Questions about these terms? Email{" "}
                <a href="mailto:hello@churchepro.com" className="font-medium text-sky hover:underline">
                  hello@churchepro.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
