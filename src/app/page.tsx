"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [vh, setVh] = useState(0);
  // Scroll progress within curtain section (0..1)
  const progressRef = useRef(0);
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
      const total = Math.max(el.offsetHeight - viewportH, 1); // total scrollable distance inside section
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      return scrolled / total; // 0..1
    };
    const onScrollOrResize = () => {
      progressRef.current = calcProgress();
      force((v) => v + 1);
    };
    onScrollOrResize();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  // WORD REVEAL: thresholds at 0, 0.25, 0.5, 0.75 of the section progress
  const thresholds = [0, 0.25, 0.5, 0.75];
  const words = ["Welcome", "to", "the", "Gala"];
  const positions = [
    { x: "10%", y: "10%" },
    { x: "40%", y: "40%" },
    { x: "60%", y: "60%" },
    { x: "90%", y: "90%" }
  ];
  // Soft curtain bottom edge via CSS mask
  const maskStyle: React.CSSProperties = {
    WebkitMaskImage:
      "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 82%, rgba(0,0,0,0) 100%)",
    maskImage:
      "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 82%, rgba(0,0,0,0) 100%)"
  };

  return (
    <main className="min-h-screen w-full bg-[#efe3c9]">
      {/* Curtain section: 200vh tall, sticky curtain fills viewport; you never leave the curtain in this phase */}
      <section ref={sectionRef} className="relative h-[200vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* NOTE: No parchment here to avoid double background. Only the curtain. */}

          {/* Curtain image that translates up with scroll */}
          <div
            className="absolute inset-0"
            style={maskStyle}
          >
            <div className="absolute inset-0 z-10">
              <Image
                src="/curtainjeep.jpeg"
                alt="Red velvet stage curtain"
                fill
                priority
                sizes="100vw"
                className="object-cover z-10"
              />
            </div>
            {/* Fallback gradient (z-0) only visible while image loads */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#9d0b0b] via-[#7a0a0a] to-[#2a0000]" />
            {/* Feathered bottom + shadow to avoid sharp edge */}
            <div
              className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-20"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)",
                opacity: 0.9,
              }}
            />
          </div>

          {/* Word overlay along NW→SE diagonal */}
          <div className="pointer-events-none absolute inset-0 z-30">
            {words.map((word, i) => {
              const start = thresholds[i];
              // Fade when progress passes the threshold (with a small ramp)
              const p = progressRef.current;
              const ramp = 0.12;
              const t = Math.max(0, Math.min(1, (p - start) / ramp));
              const scale = 0.92 + 0.08 * t;
              const pos = positions[i];
              return (
                <div
                  key={word}
                  className="absolute select-none"
                  style={{
                    left: pos.x,
                    top: pos.y,
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    opacity: t,
                    filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.35))"
                  }}
                >
                  <GoldWord text={word} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Revealed content immediately under the curtain */}
      <section
        className="min-h-screen w-full flex items-center justify-center p-8"
        style={{
          background:
            "linear-gradient(180deg, #efe3c9 0%, #ead7b5 60%, #e1cba8 100%)"
        }}
      >
        <p className="text-lg sm:text-2xl tracking-wide text-[#1e1a15]">
          the quick brown fox jumped over the lazy dog.
        </p>
      </section>
    </main>
  );
}

function GoldWord({ text }: { text: string }) {
  // Playful metallic yellow via layered gradients clipped to text
  return (
    <span
      className="font-semibold"
      style={{
        fontFamily: "ui-rounded, system-ui, Helvetica, Arial, sans-serif",
        fontSize: "clamp(28px, 6vw, 84px)",
        lineHeight: 1.05,
        letterSpacing: "0.5px",
        color: "transparent",
        backgroundImage: [
          "linear-gradient(180deg, #FFE36A 0%, #FFD34A 35%, #FFB200 65%, #E08E00 100%)",
          "radial-gradient(120% 120% at 20% 10%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 40%)",
          "radial-gradient(140% 120% at 80% 90%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 60%)"
        ].join(", "),
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        // soft inner shadow feel using text-shadow layers
        textShadow:
          "0 1px 0 rgba(0,0,0,0.2), 0 3px 8px rgba(0,0,0,0.35), 0 0 18px rgba(255,235,130,0.25)"
      }}
    >
      {text}
    </span>
  );
}
