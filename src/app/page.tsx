/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import dynamic from "next/dynamic";
import { Playfair_Display } from "next/font/google";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const Swirl = dynamic(
  () => import("@paper-design/shaders-react").then((m) => m.Swirl),
  { ssr: false }
);
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default function Home() {
  const [viewport, setViewport] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [speed, setSpeed] = useState<number>(0.4);
  const [isSpinning, setIsSpinning] = useState(false);
  const [fade, setFade] = useState(0); // 0 transparent, 1 white
  const [streakVisible, setStreakVisible] = useState(false);
  const [streakSolid, setStreakSolid] = useState(false);
  const [dockTitle, setDockTitle] = useState(false);
  const [triggerActive, setTriggerActive] = useState(false);
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
    setStreakVisible(false);
    setStreakSolid(false);
    setDockTitle(false);
    setTriggerActive(false);
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
    setTriggerActive(true);
    if (prefersReducedMotion.current) {
      setFade(1);
      setStreakVisible(true);
      setStreakSolid(true);
      setDockTitle(true);
      return;
    }
    setIsSpinning(true);
    setStreakVisible(true);
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
        // brief hold, then fade to white and show on-page title
        setTimeout(() => {
          setFade(1);
          setTimeout(() => setStreakSolid(true), 200);
          setTimeout(() => setDockTitle(true), 1200);
        }, 150);
        setIsSpinning(false);
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [speed, isSpinning]);

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
          onPointerDown={() => setTriggerActive(true)}
          onMouseEnter={() => !isSpinning && setTriggerActive(false)}
          onFocus={() => !isSpinning && setTriggerActive(false)}
          className={["pointer-events-auto entry-trigger", triggerActive ? "entry-trigger--active" : ""].join(" ")}
        >
          <span className="sr-only">Enter</span>
        </button>
      </div>

      {/* White fade overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-white transition-opacity duration-300"
        style={{ opacity: fade }}
      />

      {/* Swirl-emerging title */}
      {streakVisible && (
        <div
          aria-hidden="true"
          className={[
            "the-gala-text",
            !streakSolid ? "the-gala-streak" : dockTitle ? "the-gala-docked" : "the-gala-solid",
          ].join(" ")}
        >
          The Gala
        </div>
      )}

      <style jsx global>{`
        .the-gala-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 30;
          font-family: ${playfair.style.fontFamily};
          font-weight: 800;
          font-size: clamp(40px, 8vw, 112px);
          letter-spacing: 0.6px;
          color: transparent;
          background-image: linear-gradient(90deg, #ffd1d1 0%, #ff8a8a 50%, #660000 100%);
          -webkit-background-clip: text;
          background-clip: text;
          text-shadow: 0 0 22px rgba(255, 209, 209, 0.35);
          pointer-events: none;
        }
        .the-gala-streak {
          animation: the-gala-streak 1.2s cubic-bezier(0.22, 0.65, 0.28, 1) forwards;
          filter: blur(18px);
          opacity: 0;
        }
        .the-gala-solid {
          animation: none;
          filter: blur(0);
          opacity: 1;
          transform: translate(-50%, -50%) scale(1.2);
          transition: left 0.7s ease, top 0.7s ease, transform 0.7s ease, filter 0.5s ease;
        }
        .the-gala-docked {
          left: 64px;
          top: 64px;
          transform: translate(0, 0) scale(1);
        }
        @keyframes the-gala-streak {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.95) rotate(0deg);
            filter: blur(24px);
          }
          35% {
            opacity: 0.35;
          }
          60% {
            opacity: 0.9;
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2) rotate(540deg);
            filter: blur(8px);
          }
        }
        .entry-trigger {
          position: relative;
          pointer-events: auto;
          width: clamp(64px, 12vw, 96px);
          height: clamp(64px, 12vw, 96px);
          border-radius: 9999px;
          background: #040404;
          display: grid;
          place-items: center;
          box-shadow: 0 0 25px rgba(0, 0, 0, 0.35);
          transition: transform 0.5s cubic-bezier(0.33, 1, 0.68, 1), box-shadow 0.5s;
          outline: none;
        }
        .entry-trigger::after {
          content: "";
          position: absolute;
          inset: 15%;
          border-radius: inherit;
          border: 2px solid rgba(255, 255, 255, 0.35);
          transition: inherit;
        }
        .entry-trigger:hover,
        .entry-trigger:focus-visible {
          transform: scale(1.2) rotate(-180deg);
        }
        .entry-trigger:hover::after,
        .entry-trigger:focus-visible::after {
          inset: 10%;
        }
        .entry-trigger--active {
          transform: scale(2) rotate(-540deg);
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .entry-trigger--active::after {
          inset: 6%;
        }
        .entry-trigger:focus-visible {
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.35);
        }
        .entry-trigger:focus-visible::after {
          border-color: rgba(255, 255, 255, 0.6);
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </div>
  );
}
