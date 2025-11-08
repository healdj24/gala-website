"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const [fade, setFade] = useState(0); // 0 transparent, 1 white
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const mm = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mm.matches;
    const onChange = (e: MediaQueryListEvent) => (prefersReducedMotion.current = e.matches);
    mm.addEventListener?.("change", onChange);
    return () => mm.removeEventListener?.("change", onChange);
  }, []);

  const cancel = useCallback(() => {
    setIsAnimating(false);
    setFade(0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && !isAnimating) handleEnter();
      if (e.key === "Escape" && isAnimating) cancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAnimating, cancel]);

  const handleEnter = useCallback(() => {
    if (isAnimating) return;
    if (prefersReducedMotion.current) {
      setFade(1);
      setTimeout(() => router.push("/blank"), 200);
      return;
    }
    setIsAnimating(true);
    // Curtains slide duration ~700ms, then fade + navigate
    setTimeout(() => {
      setFade(1);
      setTimeout(() => router.push("/blank"), 250);
    }, 700);
  }, [isAnimating, router]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#2b0000]">
      {/* Subtle vignette to add depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 50%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 55%)",
        }}
      />

      {/* Left curtain */}
      <div
        className={[
          "absolute inset-y-0 left-0 w-[60vw] max-w-[800px]",
          "bg-[radial-gradient(120%_120%_at_100%_50%,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_45%),linear-gradient(180deg,#7a0a0a,#2a0000)]",
          "shadow-[0_0_80px_rgba(102,0,0,0.55)]",
          "transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isAnimating ? "-translate-x-[110%]" : "translate-x-0",
        ].join(" ")}
        style={{ clipPath: "ellipse(90% 70% at 100% 50%)" }}
      />

      {/* Right curtain */}
      <div
        className={[
          "absolute inset-y-0 right-0 w-[60vw] max-w-[800px]",
          "bg-[radial-gradient(120%_120%_at_0%_50%,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_45%),linear-gradient(180deg,#7a0a0a,#2a0000)]",
          "shadow-[0_0_80px_rgba(102,0,0,0.55)]",
          "transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isAnimating ? "translate-x-[110%]" : "translate-x-0",
        ].join(" ")}
        style={{ clipPath: "ellipse(90% 70% at 0% 50%)" }}
      />

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
    </div>
  );
}
