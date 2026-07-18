import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Churchepro",
  description: "How Churchepro collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-display text-3xl font-bold text-navy">Privacy Policy</h1>
          <p className="mt-2 text-sm text-steel">Last updated: {new Date().getFullYear()}</p>

          <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            This is a starting template and not legal advice. Please have it
            reviewed by a qualified professional before you process payments or
            go to production.
          </div>

          <div className="mt-8 space-y-8 text-steel leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-navy">1. Introduction</h2>
              <p className="mt-2">
                Churchepro (&ldquo;we&rdquo;, &ldquo;us&rdquo;) provides church
                management tools. This policy explains what information we
                collect and how we use it when you use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-navy">2. Information we collect</h2>
              <p className="mt-2">
                Account details you provide (name, email, church name, ministry
                role), content you add (attendance figures, contacts, sermons,
                prayer requests, profile photo), and basic technical data needed
                to run the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-navy">3. How we use your information</h2>
              <p className="mt-2">
                To provide and secure the service, keep each church&apos;s data
                private to that church, authenticate you, and communicate
                important account information such as password resets.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-navy">4. Data storage &amp; security</h2>
              <p className="mt-2">
                Data is stored with our infrastructure provider (Supabase) and
                protected by row-level security so churches can only access their
                own records. No method of storage is 100% secure, but we take
                reasonable measures to protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-navy">5. Sharing</h2>
              <p className="mt-2">
                We do not sell your data. We share it only with service providers
                needed to operate the platform, or where required by law.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-navy">6. Your rights</h2>
              <p className="mt-2">
                You may request access to, correction of, or deletion of your
                personal data by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-navy">7. Contact</h2>
              <p className="mt-2">
                Questions about this policy? Email{" "}
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
