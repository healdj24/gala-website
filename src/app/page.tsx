"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function CurtainsSVG({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 1000 1000"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="velvet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9d0b0b" />
          <stop offset="50%" stopColor="#7a0a0a" />
          <stop offset="100%" stopColor="#2a0000" />
        </linearGradient>
        <radialGradient id="highlightL" cx="1" cy="0.5" r="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0.07)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <radialGradient id="highlightR" cx="0" cy="0.5" r="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0.07)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="rgba(0,0,0,0.6)" />
        </filter>
      </defs>

      {/* Backdrop stage center gradient for depth */}
      <rect width="1000" height="1000" fill="#0b0b0b" />
      <radialGradient id="stageGlow" cx="0.5" cy="0.5" r="0.6">
        <stop offset="0%" stopColor="rgba(255,255,255,0.04)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </radialGradient>
      <rect width="1000" height="1000" fill="url(#stageGlow)" />

      {/* Top valance */}
      <g filter="url(#softShadow)" className={`transition-transform duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "-translate-y-[140px]" : "translate-y-0"}`}>
        <path
          d="M0,0 H1000 V180 C760,120 620,160 500,170 C380,160 240,120 0,180 Z"
          fill="url(#velvet)"
        />
        <path
          d="M0,0 H1000 V160 C760,110 620,150 500,160 C380,150 240,110 0,160 Z"
          fill="url(#highlightL)"
          opacity="0.35"
        />
      </g>

      {/* Left curtain */}
      <g
        filter="url(#softShadow)"
        className={`transition-transform duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "-translate-x-[1200px]" : "translate-x-0"}`}
      >
        <path d="M0,0 H600 C560,180 560,820 600,1000 H0 Z" fill="url(#velvet)" />
        <path d="M580,0 C560,200 560,800 580,1000" stroke="url(#highlightL)" strokeWidth="40" />
      </g>

      {/* Right curtain */}
      <g
        filter="url(#softShadow)"
        className={`transition-transform duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "translate-x-[1200px]" : "translate-x-0"}`}
      >
        <path d="M1000,0 H400 C440,180 440,820 400,1000 H1000 Z" fill="url(#velvet)" />
        <path d="M420,0 C440,200 440,800 420,1000" stroke="url(#highlightR)" strokeWidth="40" />
      </g>
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [isOpening, setIsOpening] = useState(false);
  const [fade, setFade] = useState(0); // 0 transparent, 1 black
  const prefersReducedMotion = useRef(false);
  const autoTimer = useRef<number | null>(null);

  useEffect(() => {
    const mm = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mm.matches;
    const onChange = (e: MediaQueryListEvent) => (prefersReducedMotion.current = e.matches);
    mm.addEventListener?.("change", onChange);
    return () => mm.removeEventListener?.("change", onChange);
  }, []);

  // Auto-open after a short delay if the user doesn't click.
  useEffect(() => {
    autoTimer.current = window.setTimeout(() => {
      if (!isOpening) handleEnter();
    }, 900) as unknown as number; // start auto-open shortly after load
    return () => {
      if (autoTimer.current) window.clearTimeout(autoTimer.current);
    };
  }, []);

  const cancel = useCallback(() => {
    setIsOpening(false);
    setFade(0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && !isOpening) handleEnter();
      if (e.key === "Escape" && isOpening) cancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpening, cancel]);

  const handleEnter = useCallback(() => {
    if (isOpening) return;
    if (prefersReducedMotion.current) {
      setFade(1);
      setTimeout(() => router.push("/blank"), 250);
      return;
    }
    setIsOpening(true);
    // Curtains open 1.8s → hold 300ms → fade to black 400ms → navigate
    window.setTimeout(() => {
      setFade(1);
      window.setTimeout(() => router.push("/blank"), 400);
    }, 1800 + 300);
  }, [isOpening, router]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Curtains SVG */}
      <CurtainsSVG open={isOpening} />

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

      {/* Black fade overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-400"
        style={{ opacity: fade }}
      />
    </div>
  );
}
