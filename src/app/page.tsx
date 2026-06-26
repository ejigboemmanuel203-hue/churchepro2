"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { DEMO_MODE } from "@/lib/demo-mode";
import { useScrollAnimation } from "@/lib/hooks/use-scroll-animation";

const features = [
  { icon: "🗓️", title: "Attendance", desc: "Track who attends each service and spot trends over time." },
  { icon: "🤝", title: "Follow-up", desc: "Stay in touch with members and first-time visitors." },
  { icon: "📖", title: "Daily Devotion", desc: "Share a daily devotion guide your members can read anywhere." },
  { icon: "✨", title: "AI Bible Quiz", desc: "Engage members with AI-powered Bible knowledge quizzes." },
];

const steps = [
  {
    title: "Sign up",
    desc: "Create your free account in under a minute — just your name, email, and a password.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Create your church",
    desc: "Give your church a name and you instantly get a private, secure space just for it.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
        <path d="M12 3 4 7v13h16V7l-8-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 7v3M10.5 8.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Start managing",
    desc: "Record attendance, follow up with members, post devotions, and more — all in one place.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
        <path d="M4 19V5a1 1 0 0 1 1-1h11l4 4v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M8 13l2.5 2.5L16 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Home() {
  const year = new Date().getFullYear();

  const howItWorksRef = useScrollAnimation("animate-fade-in-up");
  const featuresRef = useScrollAnimation("animate-fade-in-up");
  const ctaRef = useScrollAnimation("animate-fade-in-up");

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <HeroSlideshow />
          <div className="absolute inset-0 bg-navy/75" />
          <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-28 text-center text-white sm:py-36">
            <span className="mb-5 rounded-full bg-sky px-4 py-1 text-sm font-medium">
              Church management made simple
            </span>
            <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
              Run your church with Churchepro
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ice">
              Attendance, follow-up, daily devotions, AI Bible quizzes and more —
              each church in its own private, secure space.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              {DEMO_MODE ? (
                <>
                  <button disabled className="rounded-full bg-gray-400 px-8 py-3 font-semibold text-white cursor-not-allowed opacity-60">
                    Get started free
                  </button>
                  <button disabled className="rounded-full border border-gray-400 px-8 py-3 font-semibold text-white cursor-not-allowed opacity-60">
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="rounded-full bg-sky px-8 py-3 font-semibold text-white transition-colors hover:bg-deep"
                  >
                    Get started free
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-full border border-white/70 px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section ref={howItWorksRef} className="bg-white py-20 animate-fade-in-up">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-bold text-navy">
              How it works
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-steel">
              Get your church up and running in three simple steps.
            </p>
            <div className="relative mt-14 grid gap-10 sm:grid-cols-3">
              {/* connecting line (desktop only) */}
              <div className="absolute top-7 left-0 right-0 hidden h-0.5 bg-ice sm:block" aria-hidden="true" />
              {steps.map((s, i) => (
                <div key={s.title} className={`relative flex flex-col items-center text-center animate-fade-in-up animate-delay-${(i + 1) * 100}`}>
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-sky text-white shadow-sm">
                    {s.icon}
                  </div>
                  <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-steel">
                    Step {i + 1}
                  </span>
                  <h3 className="mt-1 font-semibold text-navy">{s.title}</h3>
                  <p className="mt-2 max-w-xs text-sm text-steel">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section ref={featuresRef} className="bg-ice py-20 animate-fade-in-up">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-bold text-navy">
              Everything your church needs
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-steel">
              One simple platform for the people and programs you serve.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className={`rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 animate-fade-in-up animate-delay-${(i + 1) * 100}`}
                >
                  <div className="text-3xl">{f.icon}</div>
                  <h3 className="mt-4 font-semibold text-deep">{f.title}</h3>
                  <p className="mt-2 text-sm text-steel">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section ref={ctaRef} className="bg-deep py-16 animate-fade-in-up">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-bold text-white">
              {DEMO_MODE ? "Demo Mode" : "Ready to get started?"}
            </h2>
            <p className="mt-3 text-ice">
              {DEMO_MODE ? "This is a read-only preview for observation only." : "Create your church's account in under two minutes."}
            </p>
            {DEMO_MODE ? (
              <button disabled className="mt-8 inline-block rounded-full bg-gray-600 px-8 py-3 font-semibold text-white cursor-not-allowed opacity-60">
                Get started free
              </button>
            ) : (
              <Link
                href="/signup"
                className="mt-8 inline-block rounded-full bg-sky px-8 py-3 font-semibold text-white transition-colors hover:bg-navy"
              >
                Get started free
              </Link>
            )}
          </div>
        </section>

        <footer className="bg-navy py-8 text-center text-sm text-ice">
          © {year} Churchepro. All rights reserved.
        </footer>
      </main>
    </>
  );
}
