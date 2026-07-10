"use client";

import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { Reveal } from "@/components/reveal";
import { DEMO_MODE } from "@/lib/demo-mode";
import { MISSION, VISION } from "@/lib/about";

const features: { image: string; title: string; desc: string }[] = [
  { image: "/card-attendance.jpg", title: "Attendance", desc: "Track who attends each service and spot trends over time." },
  { image: "/login-side.png", title: "Follow-up", desc: "Stay in touch with members and first-time visitors." },
  { image: "/hero-3.jpg", title: "Sermons", desc: "Share sermon messages members can listen to and download." },
  { image: "/card-prayer.jpg", title: "Prayer Requests", desc: "Let members send anonymous requests to the prayer team." },
  { image: "/card-devotion.jpg", title: "Daily Devotion", desc: "Share a daily devotion guide your members can read anywhere." },
  { image: "/card-quiz.jpg", title: "Bible Quiz", desc: "Engage members with fun Bible knowledge quizzes." },
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
            <h1 className="font-display text-4xl font-bold leading-tight text-shadow-soft sm:text-6xl">
              Run your church with <span className="text-sky">Churchepro</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg font-medium text-ice text-shadow-soft">
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
        <section className="bg-gradient-to-b from-white to-ice/60 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <h2 className="text-center font-display text-3xl font-bold text-navy">
                How it works
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-center text-steel">
                Get your church up and running in three simple steps.
              </p>
            </Reveal>
            <div className="relative mt-14 grid gap-10 sm:grid-cols-3">
              {/* connecting line (desktop only) */}
              <div className="absolute top-7 left-0 right-0 hidden h-0.5 bg-ice sm:block" aria-hidden="true" />
              {steps.map((s, i) => (
                <Reveal key={s.title} delay={i * 120} className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-sky text-white shadow-sm">
                    {s.icon}
                  </div>
                  <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-steel">
                    Step {i + 1}
                  </span>
                  <h3 className="mt-1 font-semibold text-navy">{s.title}</h3>
                  <p className="mt-2 max-w-xs text-sm text-steel">{s.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-gradient-to-b from-ice/60 to-ice/30 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <h2 className="text-center font-display text-3xl font-bold text-navy">
                Everything your church needs
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-center text-steel">
                One simple platform for the people and programs you serve.
              </p>
            </Reveal>
            <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-2">
              {features.map((f, i) => (
                <Reveal key={f.title} delay={(i % 2) * 120} className="h-full">
                  <div className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-sky/15 hover:ring-sky">
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <Image
                        src={f.image}
                        alt={f.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 22rem"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-7">
                      <h3 className="font-display text-2xl font-bold tracking-tight text-navy">
                        {f.title}
                      </h3>
                      <p className="mt-2 leading-relaxed text-steel">{f.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="bg-gradient-to-b from-ice/30 to-ice/60 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <Reveal>
              <h2 className="text-center font-display text-3xl font-bold text-navy">
                Our heart
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-center text-steel">
                Why Churchepro exists.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <Reveal className="h-full">
                <div className="flex h-full flex-col rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky text-white shadow-sm">
                    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
                      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-bold text-navy">
                    Our Mission
                  </h3>
                  <p className="mt-3 leading-relaxed text-steel">{MISSION}</p>
                </div>
              </Reveal>
              <Reveal delay={120} className="h-full">
                <div className="flex h-full flex-col rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-deep text-white shadow-sm">
                    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-bold text-navy">
                    Our Vision
                  </h3>
                  <p className="mt-3 leading-relaxed text-steel">{VISION}</p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-deep to-sky py-16">
          <Reveal className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-display text-3xl font-bold text-white">
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
          </Reveal>
        </section>

        <footer className="bg-navy py-8 text-center text-sm text-ice">
          © {year} Churchepro. All rights reserved.
        </footer>
      </main>
    </>
  );
}
