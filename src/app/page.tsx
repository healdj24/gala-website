"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [vh, setVh] = useState(0);
  // Scroll target vs. smoothed (inertial) progress
  const targetProgressRef = useRef(0);
  const smoothProgressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [, force] = useState(0); // re-render trigger

  useEffect(() => {
    const updateVh = () => setVh(window.innerHeight || 0);
    updateVh();
    window.addEventListener("resize", updateVh);
    return () => window.removeEventListener("resize", updateVh);
  }, []);

  useEffect(() => {
    const calcProgress = () => {
      const el = sectionRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const total = Math.max(el.offsetHeight - viewportH, 1); // total scrollable distance
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      return scrolled / total; // 0..1
    };
    const onScrollOrResize = () => {
      targetProgressRef.current = calcProgress();
      startLoop();
    };
    onScrollOrResize();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  function startLoop() {
    if (rafRef.current) return;
    const tick = () => {
      const target = targetProgressRef.current;
      // Inertia: lerp current toward target
      const alpha = 0.08; // lower = heavier curtain
      smoothProgressRef.current =
        smoothProgressRef.current + (target - smoothProgressRef.current) * alpha;

      // Ease-out + slight back near the end for weight
      const x = smoothProgressRef.current;
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const eased = easeOutCubic(x);
      const c1 = 1.70158;
      const c3 = c1 + 1;
      const back = 1 + c3 * Math.pow(eased - 1, 3) + c1 * Math.pow(eased - 1, 2);
      const blend = eased < 0.85 ? eased : eased * 0.9 + Math.min(back, 1.03) * 0.1;

      // Trigger a re-render (for transform)
      force((v) => v + 1);

      const closeEnough = Math.abs(target - smoothProgressRef.current) < 0.001;
      if (!closeEnough) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        smoothProgressRef.current = target;
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  // Compute displayed eased value for transform
  const displayed = (() => {
    const x = smoothProgressRef.current;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const eased = easeOutCubic(x);
    const c1 = 1.70158;
    const c3 = c1 + 1;
    const back = 1 + c3 * Math.pow(eased - 1, 3) + c1 * Math.pow(eased - 1, 2);
    return eased < 0.85 ? eased : eased * 0.9 + Math.min(back, 1.03) * 0.1;
  })();

  const curtainOffsetY = -(displayed * vh);

  return (
    <main className="min-h-screen w-full bg-[#efe5cf]">
      {/* Curtain section: 200vh tall, sticky curtain fills viewport and lifts as you scroll */}
      <section ref={sectionRef} className="relative h-[200vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Aged parchment below (layered gradients + vignette + noise) */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: [
                // subtle paper fibers
                "repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)",
                // vertical streaks/scratches
                "repeating-linear-gradient(90deg, rgba(0,0,0,0.025) 0px, rgba(0,0,0,0.025) 1px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 7px)",
                // discoloration blobs
                "radial-gradient(600px 400px at 18% 22%, rgba(80,50,20,0.08), rgba(0,0,0,0) 60%)",
                "radial-gradient(700px 450px at 78% 30%, rgba(70,45,15,0.06), rgba(0,0,0,0) 60%)",
                "radial-gradient(500px 350px at 40% 75%, rgba(60,40,15,0.05), rgba(0,0,0,0) 60%)",
                // parchment base
                "linear-gradient(180deg, #efe5cf 0%, #eadcbe 60%, #e1d3b3 100%)",
              ].join(", "),
              boxShadow:
                "inset 0 0 160px rgba(0,0,0,0.22), inset 0 0 24px rgba(0,0,0,0.12)",
            }}
          />
          {/* SVG noise overlay for grain */}
          <svg
            className="pointer-events-none absolute inset-0 opacity-15 mix-blend-multiply"
            xmlns="http://www.w3.org/2000/svg"
          >
            <filter id="noiseFilter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves="4"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>

          {/* Curtain image that translates up with scroll */}
          <div
            className="absolute inset-0 will-change-transform"
            style={{ transform: `translateY(${curtainOffsetY}px)` }}
          >
            <div className="absolute inset-0">
              <Image
                src="/curtainjeep.jpeg"
                alt="Red velvet stage curtain"
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
            {/* Fallback color/texture if the image isn't present yet */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#9d0b0b] via-[#7a0a0a] to-[#2a0000]" />
            {/* Bottom edge shadow to add weight while lifting */}
            <div
              className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)",
                opacity: 0.9,
              }}
            />
          </div>
        </div>
      </section>

      {/* Revealed content after curtain fully lifts */}
      <section className="min-h-screen w-full flex items-center justify-center p-8">
        <p className="text-lg sm:text-2xl tracking-wide text-[#1e1a15]">
          the quick brown fox jumped over the lazy dog.
        </p>
      </section>
    </main>
  );
}
