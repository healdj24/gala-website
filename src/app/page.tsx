"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0); // 0..1
  const [vh, setVh] = useState(0);

  useEffect(() => {
    const updateVh = () => setVh(window.innerHeight || 0);
    updateVh();
    window.addEventListener("resize", updateVh);
    return () => window.removeEventListener("resize", updateVh);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const total = el.offsetHeight - viewportH; // total scrollable distance inside section
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      setProgress(total > 0 ? scrolled / total : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const curtainOffsetY = -(progress * vh);

  return (
    <main className="min-h-screen w-full bg-[#f3ead8]">
      {/* Curtain section: 200vh tall, sticky curtain fills viewport and lifts as you scroll */}
      <section ref={sectionRef} className="relative h-[200vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Beige plane underneath */}
          <div className="absolute inset-0 bg-[#f3ead8]" />

          {/* Curtain image that translates up with scroll */}
          <div
            className="absolute inset-0 will-change-transform"
            style={{ transform: `translateY(${curtainOffsetY}px)` }}
          >
            <div className="absolute inset-0">
              <Image
                src="/curtain.jpg"
                alt="Red velvet stage curtain"
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
            {/* Fallback color/texture if the image isn't present yet */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#9d0b0b] via-[#7a0a0a] to-[#2a0000]" />
          </div>
        </div>
      </section>

      {/* Revealed content after curtain fully lifts */}
      <section className="min-h-screen w-full bg-[#f3ead8] flex items-center justify-center p-8">
        <p className="text-lg sm:text-2xl tracking-wide text-[#1e1a15]">
          the quick brown fox jumped over the lazy dog.
        </p>
      </section>
    </main>
  );
}
