/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const Swirl = dynamic(
  () => import("@paper-design/shaders-react").then((m) => m.Swirl),
  { ssr: false }
);

export default function Home() {
  const router = useRouter();
  const [viewport, setViewport] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [speed, setSpeed] = useState<number>(0.4);
  const [isSpinning, setIsSpinning] = useState(false);
  const [fade, setFade] = useState(0); // 0 transparent, 1 white
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

  const cancelSpin = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setIsSpinning(false);
    setSpeed(0.4);
    setFade(0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && !isSpinning) {
        void handleEnter();
      }
      if (e.key === "Escape" && isSpinning) {
        cancelSpin();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSpinning, cancelSpin]);

  const handleEnter = useCallback(async () => {
    if (isSpinning) return;
    if (prefersReducedMotion.current) {
      setFade(1);
      setTimeout(() => router.push("/blank"), 200);
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
        // brief hold, then fade and navigate
        setTimeout(() => {
          setFade(1);
          setTimeout(() => router.push("/blank"), 250);
        }, 150);
        setIsSpinning(false);
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [router, speed, isSpinning]);

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
          onClick={() => handleEnter()}
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
    </div>
  );
}
