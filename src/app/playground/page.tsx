"use client";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";

const Swirl = dynamic(
  () => import("@paper-design/shaders-react").then((m) => m.Swirl),
  { ssr: false }
);

type Params = {
  width: number;
  height: number;
  colors: string[];
  colorBack: string;
  bandCount: number;
  twist: number;
  center: number;
  proportion: number;
  softness: number;
  noise: number;
  noiseFrequency: number;
  speed: number;
};

const PRESETS: Record<string, Partial<Params>> = {
  OxbloodParlor: {
    colors: ["#ffd1d1", "#ff8a8a", "#660000"],
    colorBack: "#330000",
    bandCount: 4,
    twist: 0.1,
    center: 0.2,
    proportion: 0.5,
    softness: 0,
    noise: 0.2,
    noiseFrequency: 0.4,
    speed: 0.56
  },
  EmeraldParlor: {
    colors: ["#d7ffd1", "#7bd389", "#0f3d2e"],
    colorBack: "#081e14",
    bandCount: 5,
    twist: 0.12,
    center: 0.25,
    proportion: 0.55,
    softness: 0.05,
    noise: 0.18,
    noiseFrequency: 0.35,
    speed: 0.5
  },
  IvorySalon: {
    colors: ["#fff7e6", "#e3d7b8", "#6b5b3a"],
    colorBack: "#221b11",
    bandCount: 3,
    twist: 0.08,
    center: 0.18,
    proportion: 0.48,
    softness: 0.04,
    noise: 0.15,
    noiseFrequency: 0.3,
    speed: 0.45
  }
};

export default function PlaygroundPage() {
  const [params, setParams] = useState<Params>({
    width: 1280,
    height: 720,
    colors: ["#ffd1d1", "#ff8a8a", "#660000"],
    colorBack: "#330000",
    bandCount: 4,
    twist: 0.1,
    center: 0.2,
    proportion: 0.5,
    softness: 0,
    noise: 0.2,
    noiseFrequency: 0.4,
    speed: 0.56
  });

  const applyPreset = (key: string) => {
    const p = PRESETS[key];
    if (!p) return;
    setParams((cur) => ({ ...cur, ...p }));
  };

  const size = useMemo(() => {
    // Fit to a wide container width; keep aspect ratio 16:9
    const width = 1200;
    const height = Math.round((9 / 16) * width);
    return { width, height };
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-wide">Swirl Playground</h1>
            <p className="text-sm text-neutral-400">
              Victorian-themed presets; tweak and export ideas.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(PRESETS).map((k) => (
              <button
                key={k}
                onClick={() => applyPreset(k)}
                className="rounded border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800"
              >
                {k}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-3 lg:col-span-3">
            <div className="w-full overflow-hidden rounded-md border border-neutral-800">
              <Swirl {...{ ...params, ...size }} />
            </div>
          </section>

        <aside className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <Control
              label="Band Count"
              value={params.bandCount}
              min={1}
              max={10}
              step={1}
              onChange={(v) => setParams((p) => ({ ...p, bandCount: v }))}
            />
            <Control
              label="Twist"
              value={params.twist}
              min={0}
              max={0.5}
              step={0.005}
              onChange={(v) => setParams((p) => ({ ...p, twist: v }))}
            />
            <Control
              label="Center"
              value={params.center}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setParams((p) => ({ ...p, center: v }))}
            />
            <Control
              label="Proportion"
              value={params.proportion}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setParams((p) => ({ ...p, proportion: v }))}
            />
            <Control
              label="Softness"
              value={params.softness}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setParams((p) => ({ ...p, softness: v }))}
            />
            <Control
              label="Noise"
              value={params.noise}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setParams((p) => ({ ...p, noise: v }))}
            />
            <Control
              label="Noise Freq"
              value={params.noiseFrequency}
              min={0}
              max={2}
              step={0.01}
              onChange={(v) => setParams((p) => ({ ...p, noiseFrequency: v }))}
            />
            <Control
              label="Speed"
              value={params.speed}
              min={0}
              max={2}
              step={0.01}
              onChange={(v) => setParams((p) => ({ ...p, speed: v }))}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}

function Control({
  label,
  value,
  min,
  max,
  step,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block text-sm">
      <div className="mb-1 text-neutral-300">
        {label}: <span className="tabular-nums text-neutral-400">{value.toFixed(3)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-amber-400"
      />
    </label>
  );
}


