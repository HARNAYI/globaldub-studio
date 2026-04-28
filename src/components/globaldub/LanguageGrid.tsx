import { Check, Search } from "lucide-react";
import { useState } from "react";
import { SectionHeader } from "./UploadArea";

const LANGUAGES = [
  { code: "EN", name: "English", flag: "🇺🇸", region: "United States" },
  { code: "ES", name: "Spanish", flag: "🇪🇸", region: "Spain · LATAM" },
  { code: "FR", name: "French", flag: "🇫🇷", region: "France" },
  { code: "DE", name: "German", flag: "🇩🇪", region: "Germany" },
  { code: "IT", name: "Italian", flag: "🇮🇹", region: "Italy" },
  { code: "PT", name: "Portuguese", flag: "🇧🇷", region: "Brazil" },
  { code: "JA", name: "Japanese", flag: "🇯🇵", region: "Japan" },
  { code: "KO", name: "Korean", flag: "🇰🇷", region: "South Korea" },
  { code: "ZH", name: "Mandarin", flag: "🇨🇳", region: "China" },
  { code: "HI", name: "Hindi", flag: "🇮🇳", region: "India" },
  { code: "AR", name: "Arabic", flag: "🇸🇦", region: "MENA" },
];

export const LanguageGrid = () => {
  const [selected, setSelected] = useState<string[]>(["EN", "ES", "FR", "JA", "PT"]);
  const toggle = (c: string) =>
    setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));

  return (
    <section className="container py-12">
      <SectionHeader
        step="02"
        title="Choose target languages"
        subtitle="Select up to 11 languages for simultaneous translation & dubbing."
        right={
          <div className="flex items-center gap-3">
            <div className="glass rounded-full pl-3 pr-1 h-10 flex items-center gap-2 w-64">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search languages…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
              />
            </div>
            <div className="glass rounded-full px-4 h-10 flex items-center text-sm">
              Selected{" "}
              <span className="ml-2 gradient-text font-semibold">
                {selected.length} / 11
              </span>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 mt-8">
        {LANGUAGES.map((l, i) => {
          const active = selected.includes(l.code);
          return (
            <button
              key={l.code}
              onClick={() => toggle(l.code)}
              style={{ animationDelay: `${i * 30}ms` }}
              className={`group relative rounded-2xl p-4 text-left transition-all duration-300 animate-fade-in
                ${active
                  ? "gradient-border shadow-glow"
                  : "glass hover:border-border hover:-translate-y-0.5"}`}
            >
              {active && (
                <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="text-3xl leading-none">{l.flag}</div>
                <div className="min-w-0">
                  <div className="text-[15px] font-medium truncate">{l.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{l.region}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted-foreground tracking-wider">{l.code}</span>
                <Switch active={active} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

const Switch = ({ active }: { active: boolean }) => (
  <span
    className={`inline-flex h-5 w-9 rounded-full transition-colors items-center px-0.5 ${
      active ? "bg-gradient-primary" : "bg-secondary"
    }`}
  >
    <span
      className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
        active ? "translate-x-4" : "translate-x-0"
      }`}
    />
  </span>
);
