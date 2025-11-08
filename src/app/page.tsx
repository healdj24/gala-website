"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Cinzel } from "next/font/google";

export default function Home() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const beigeRef = useRef<HTMLElement | null>(null);
  const [vh, setVh] = useState(0);
  // Scroll progress within curtain section (0..1)
  const progressRef = useRef(0);
  const beigeFadeRef = useRef(0);
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
      // Compute beige fade based on beige section entering viewport
      if (beigeRef.current) {
        const br = beigeRef.current.getBoundingClientRect();
        const viewportH = window.innerHeight;
        // Start fade when beige top crosses 85% of viewport, complete by 55%
        const start = viewportH * 0.85;
        const end = viewportH * 0.55;
        const raw = 1 - (br.top - end) / (start - end);
        beigeFadeRef.current = Math.max(0, Math.min(1, raw));
      }
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
  // Even spacing including margins: positions at i/(N+1) along the diagonal NW→SE
  const positions = [
    { x: "20%", y: "20%" }, // edge margin equals internal spacing
    { x: "40%", y: "40%" },
    { x: "60%", y: "60%" },
    { x: "80%", y: "80%" }
  ];
  // Soft curtain bottom edge via CSS mask
  const maskStyle: React.CSSProperties = {
    WebkitMaskImage:
      "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 88%, rgba(0,0,0,0) 100%)",
    maskImage:
      "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 88%, rgba(0,0,0,0) 100%)"
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

          {/* Centered \"Welcome\" then \"to\" on the curtain, sequential fade-in */}
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
            <div className="text-center space-y-3">
              {(() => {
                const p = progressRef.current;
                const ramp = 0.12;
                const tWelcome = Math.max(0, Math.min(1, (p - 0.0) / ramp));
                const tTo = Math.max(0, Math.min(1, (p - 0.12) / ramp));
                const scaleW = 0.92 + 0.08 * tWelcome;
                const scaleT = 0.92 + 0.08 * tTo;
                return (
                  <>
                    <div
                      className="select-none"
                      style={{
                        opacity: tWelcome,
                        transform: `scale(${scaleW})`,
                        filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.35))"
                      }}
                    >
                      <ChromeGoldWord text="Welcome" />
                    </div>
                    <div
                      className="select-none"
                      style={{
                        opacity: tTo,
                        transform: `scale(${scaleT})`,
                        filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.35))"
                      }}
                    >
                      <ChromeGoldWord text="to" />
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Revealed content immediately under the curtain */}
      <section
        ref={beigeRef}
        className="min-h-screen w-full flex items-center justify-center p-8"
        style={{
          background:
            "linear-gradient(180deg, #efe3c9 0%, #ead7b5 60%, #e1cba8 100%)"
        }}
      >
        <div className="text-center space-y-6">
          {/* 'The Gala' fades in as the beige enters view, in crimson variant */}
          <div
            className="select-none"
            style={{
              opacity: beigeFadeRef.current,
              transform: `scale(${0.96 + 0.04 * beigeFadeRef.current})`,
              filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.25))"
            }}
          >
            <CrimsonWord text="The Gala" />
          </div>
          <p className="text-lg sm:text-2xl tracking-wide text-[#1e1a15]">
            the quick brown fox jumped over the lazy dog.
          </p>
        </div>
      </section>
    </main>
  );
}

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["700", "800", "900"]
});

function GoldWord({ text }: { text: string }) {
  // Playful metallic yellow via layered gradients clipped to text
  return (
    <span
      className={`${cinzel.className} font-extrabold`}
      style={{
        fontSize: "clamp(36px, 7vw, 96px)",
        lineHeight: 1.02,
        letterSpacing: "0.6px",
        color: "transparent",
        backgroundImage: [
          // gold body
          "linear-gradient(180deg, #FFE770 0%, #FFD54F 30%, #FFB300 62%, #C88200 100%)",
          // top-left specular highlight
          "radial-gradient(120% 120% at 20% 8%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.3) 10%, rgba(255,255,255,0) 38%)",
          // bottom-right reflected shadow
          "radial-gradient(120% 120% at 80% 90%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 55%)"
        ].join(", "),
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        // subtle stroke and bevel via shadows (3D feel, no hard edges)
        WebkitTextStroke: "1px rgba(140,90,0,0.35)",
        textShadow: [
          "0 1px 0 rgba(255,255,255,0.45)",        // top bevel highlight
          "0 2px 0 rgba(255,225,120,0.35)",       // soft rim
          "0 4px 6px rgba(0,0,0,0.35)",           // drop shadow
          "0 8px 18px rgba(0,0,0,0.25)"           // global glow
        ].join(", ")
      }}
    >
      {text}
    </span>
  );
}

function CrimsonWord({ text }: { text: string }) {
  return (
    <span
      className={`${cinzel.className} font-extrabold`}
      style={{
        fontSize: "clamp(40px, 8vw, 112px)",
        lineHeight: 1.02,
        letterSpacing: "0.8px",
        color: "transparent",
        backgroundImage: [
          // curtain crimson
          "linear-gradient(180deg, #ff3b3b 0%, #d11212 35%, #9b0c0c 65%, #5a0000 100%)",
          // subtle specular highlight
          "radial-gradient(120% 120% at 18% 10%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 38%)",
          // soft corner shadow
          "radial-gradient(120% 120% at 82% 90%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 55%)"
        ].join(", "),
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextStroke: "1px rgba(80,0,0,0.35)",
        textShadow: [
          "0 1px 0 rgba(255,180,180,0.35)",
          "0 2px 0 rgba(180,0,0,0.25)",
          "0 6px 10px rgba(0,0,0,0.35)"
        ].join(", ")
      }}
    >
      {text}
    </span>
  );
}

function ChromeGoldWord({ text, size = "clamp(44px,8vw,120px)" }: { text: string; size?: string }) {
  // Serif chrome-gold using SVG gradients + specular lighting, kept smooth and reflective
  return (
    <svg
      viewBox="0 0 1000 220"
      width="100%"
      style={{ display: "block" }}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF4B4" />
          <stop offset="28%" stopColor="#FFD451" />
          <stop offset="58%" stopColor="#F1B10A" />
          <stop offset="78%" stopColor="#B87806" />
          <stop offset="100%" stopColor="#5A3A00" />
        </linearGradient>
        <linearGradient id="goldStroke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A46A00" />
          <stop offset="100%" stopColor="#3A1F00" />
        </linearGradient>
        <filter id="goldChrome" x="-30%" y="-50%" width="160%" height="220%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.6" result="blur" />
          <feSpecularLighting
            in="blur"
            surfaceScale="4"
            specularConstant="1.05"
            specularExponent="28"
            lightingColor="#ffffff"
            result="spec"
          >
            <fePointLight x="-5000" y="-12000" z="20000" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specCut" />
          <feComposite in="SourceGraphic" in2="specCut" operator="arithmetic" k2="1" k3="1" />
        </filter>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.2" result="g" />
          <feMerge>
            <feMergeNode in="g" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <text
        x="50%"
        y="60%"
        textAnchor="middle"
        dominantBaseline="middle"
        filter="url(#goldChrome)"
        fill="url(#goldFill)"
        stroke="url(#goldStroke)"
        strokeWidth="1.5"
        className={cinzel.className}
        style={{ fontSize: size, letterSpacing: "0.04em", paintOrder: "stroke" }}
      >
        {text}
      </text>
      <g fill="#ffffff" opacity="0.85" filter="url(#glow)">
        <path d="M510 40 l8 22 22 8 -22 8 -8 22 -8 -22 -22 -8 22 -8z" />
        <path d="M760 120 l6 18 18 6 -18 6 -6 18 -6 -18 -18 -6 18 -6z" opacity="0.65" />
        <path d="M280 150 l5 14 14 5 -14 5 -5 14 -5 -14 -14 -5 14 -5z" opacity="0.5" />
      </g>
    </svg>
  );
}
