"use client";
import { useEffect, useState } from "react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default function BlankPage() {
  const [visible, setVisible] = useState(false); // fade in
  const [dock, setDock] = useState(false); // move to top-left after delay

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 150);
    const t2 = setTimeout(() => setDock(true), 1200); // per spec: 1200ms
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-white text-black">
      <div
        className={[
          "pointer-events-none fixed z-10 select-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          visible ? "opacity-100" : "opacity-0",
          dock
            ? "left-10 top-10 translate-x-0 translate-y-0"
            : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        ].join(" ")}
        aria-hidden="true"
      >
        <h1
          className={`${playfair.className} font-extrabold`}
          style={{ fontSize: "clamp(40px, 8vw, 112px)", lineHeight: 1.02, letterSpacing: "0.6px" }}
        >
          The Gala
        </h1>
      </div>
    </main>
  );
}


