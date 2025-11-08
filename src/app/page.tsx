"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const Swirl = dynamic(
  () => import("@paper-design/shaders-react").then((m) => m.Swirl),
  { ssr: false }
);

export default function Home() {
  const [viewport, setViewport] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [speed, setSpeed] = useState<number>(0.4);
  const [isSpinning, setIsSpinning] = useState(false);
  const [fade, setFade] = useState(0); // 0 transparent, 1 white
  const [showTitle, setShowTitle] = useState(false);
  const [dockTitle, setDockTitle] = useState(false);
  const prefersReducedMotion = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const mm = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mm.matches;
    const onChange = (e: MediaQueryListEvent) => (prefersReducedMotion.current = e.matches);
    mm.addEventListener?.("change", onChange);
    return () => mm.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const params = useMemo(
    () => ({
      width: Math.max(1, viewport.w),
      height: Math.max(1, viewport.h),
      colors: ["#ffd1d1", "#ff8a8a", "#660000"],
      colorBack: "#330000",
      bandCount: 4,
      twist: 0.1,
      center: 0.2,
      proportion: 0.5,
      softness: 0,
      noise: 0.2,
      noiseFrequency: 0.4,
      speed,
    }),
    [viewport, speed]
  );

  const handleEnter = useCallback(() => {
    if (isSpinning) return;
    if (prefersReducedMotion.current) {
      setFade(1);
      setShowTitle(true);
      setTimeout(() => setDockTitle(true), 1200);
      return;
    }
    setIsSpinning(true);
    const start = performance.now();
    const duration = 1200; // ms
    const startSpeed = speed;
    const targetSpeed = 8.0; // fast
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const s = startSpeed + (targetSpeed - startSpeed) * ease(t);
      setSpeed(s);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // brief hold, then fade and show title
        setTimeout(() => {
          setFade(1);
          setTimeout(() => setShowTitle(true), 150);
          setTimeout(() => setDockTitle(true), 1200);
        }, 150);
        setIsSpinning(false);
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [isSpinning, speed]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Swirl full-viewport */}
      <div className="absolute inset-0">
        <Swirl {...params} />
      </div>

      {/* Centered Enter button */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <button
          type="button"
          aria-label="Enter"
          onClick={handleEnter}
          className="pointer-events-auto select-none rounded-full bg-white/90 px-8 py-3 text-lg font-medium text-black shadow-xl ring-1 ring-black/10 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          Enter
        </button>
      </div>

      {/* White fade overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-white transition-opacity duration-300"
        style={{ opacity: fade }}
      />

      {/* Title: appears 3x, then docks to top-left at 1x */}
      {showTitle && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-10 select-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            left: dockTitle ? 40 : "50%",
            top: dockTitle ? 40 : "50%",
            transform: dockTitle
              ? "translate(0, 0) scale(1)"
              : "translate(-50%, -50%) scale(3)",
            opacity: 1,
          }}
        >
          <h1
            className="font-extrabold"
            style={{
              fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
              fontSize: "clamp(40px, 8vw, 112px)",
              lineHeight: 1.02,
              letterSpacing: "0.6px",
              color: "#000",
            }}
          >
            The Gala
          </h1>
        </div>
      )}
    </div>
  );
}
