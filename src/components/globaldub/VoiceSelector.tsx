import { Play, Mic } from "lucide-react";
import { useState } from "react";
import { SectionHeader } from "./UploadArea";

const TABS = ["English", "Spanish", "French", "Japanese", "Portuguese"];
const VOICES = [
  { name: "Aurora", gender: "Female", accent: "US", emotion: "Energetic", color: "from-brand-purple to-brand-blue" },
  { name: "Kai", gender: "Male", accent: "UK", emotion: "Calm", color: "from-brand-blue to-brand-cyan" },
  { name: "Nova", gender: "Female", accent: "AU", emotion: "Neutral", color: "from-brand-cyan to-brand-purple" },
  { name: "Atlas", gender: "Male", accent: "US", emotion: "Authoritative", color: "from-brand-purple to-brand-cyan" },
  { name: "Iris", gender: "Female", accent: "IE", emotion: "Warm", color: "from-brand-blue to-brand-purple" },
  { name: "Orion", gender: "Male", accent: "CA", emotion: "Friendly", color: "from-brand-cyan to-brand-blue" },
];

export const VoiceSelector = () => {
  const [tab, setTab] = useState(0);
  const [selected, setSelected] = useState("Aurora");

  return (
    <section className="container py-12">
      <SectionHeader step="03" title="Pick AI dubbing voices" subtitle="47 native voices across 11 languages, with emotion control." />

      {/* Tabs */}
      <div className="mt-7 overflow-x-auto scrollbar-thin">
        <div className="flex gap-2 min-w-max pb-1">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`px-4 h-9 rounded-full text-sm transition-all whitespace-nowrap ${
                tab === i
                  ? "bg-gradient-primary text-white shadow-glow"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {VOICES.map((v, i) => {
          const active = selected === v.name;
          return (
            <button
              key={v.name}
              onClick={() => setSelected(v.name)}
              style={{ animationDelay: `${i * 50}ms` }}
              className={`group text-left rounded-2xl p-5 transition-all duration-300 animate-fade-in
                ${active ? "gradient-border shadow-glow" : "glass hover:-translate-y-0.5"}`}
            >
              <div className="flex items-center gap-4">
                <div className={`relative h-12 w-12 rounded-2xl bg-gradient-to-br ${v.color} flex items-center justify-center shrink-0`}>
                  <Mic className="h-5 w-5 text-white" />
                  {active && <span className="absolute inset-0 rounded-2xl ring-2 ring-accent ring-offset-2 ring-offset-card animate-pulse-glow" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-[15px]">{v.name}</h4>
                    <span className="text-[10px] font-mono text-muted-foreground">{v.accent}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{v.gender} · {v.emotion}</div>
                </div>
                <button className="h-9 w-9 rounded-full glass flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Play className="h-3.5 w-3.5 fill-current" />
                </button>
              </div>

              {/* Waveform */}
              <div className="mt-4 flex items-end gap-0.5 h-8">
                {Array.from({ length: 42 }).map((_, k) => (
                  <span
                    key={k}
                    className={`flex-1 rounded-full ${active ? "bg-gradient-primary" : "bg-border"}`}
                    style={{ height: `${20 + Math.abs(Math.sin(k * 0.6 + i)) * 80}%` }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
