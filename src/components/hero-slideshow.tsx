"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  { src: "/hero-exterior-v2.jpg", alt: "Modern church building exterior" },
  { src: "/hero-2.jpg", alt: "Congregation worshipping with hands raised" },
  { src: "/hero-3.jpg", alt: "Pastor preaching to a full congregation" },
];

// Crossfading background slideshow for the hero section.
export function HeroSlideshow({ intervalMs = 5000 }: { intervalMs?: number }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return (
    <div className="absolute inset-0 -z-10">
      {SLIDES.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
