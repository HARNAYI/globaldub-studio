import { Check, Search, X, Sparkles, ListChecks, Globe2, CheckCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { SectionHeader } from "./UploadArea";

type Continent = "Americas" | "Europe" | "Asia" | "MENA";

const LANGUAGES: {
  code: string; name: string; flag: string; region: string;
  continent: Continent; popular?: boolean;
}[] = [
  { code: "EN", name: "English", flag: "🇺🇸", region: "United States", continent: "Americas", popular: true },
  { code: "ES", name: "Spanish", flag: "🇪🇸", region: "Spain · LATAM", continent: "Europe", popular: true },
  { code: "FR", name: "French", flag: "🇫🇷", region: "France", continent: "Europe", popular: true },
  { code: "DE", name: "German", flag: "🇩🇪", region: "Germany", continent: "Europe" },
  { code: "IT", name: "Italian", flag: "🇮🇹", region: "Italy", continent: "Europe" },
  { code: "PT", name: "Portuguese", flag: "🇧🇷", region: "Brazil", continent: "Americas", popular: true },
  { code: "JA", name: "Japanese", flag: "🇯🇵", region: "Japan", continent: "Asia", popular: true },
  { code: "KO", name: "Korean", flag: "🇰🇷", region: "South Korea", continent: "Asia" },
  { code: "ZH", name: "Mandarin", flag: "🇨🇳", region: "China", continent: "Asia", popular: true },
  { code: "HI", name: "Hindi", flag: "🇮🇳", region: "India", continent: "Asia" },
  { code: "AR", name: "Arabic", flag: "🇸🇦", region: "MENA", continent: "MENA" },
];

type FilterId = "all" | "selected" | "popular" | "Americas" | "Europe" | "Asia" | "MENA";

const FILTERS: { id: FilterId; label: string; icon?: React.ReactNode }[] = [
  { id: "all", label: "All", icon: <Globe2 className="h-3.5 w-3.5" /> },
  { id: "selected", label: "Selected", icon: <ListChecks className="h-3.5 w-3.5" /> },
  { id: "popular", label: "Popular", icon: <Sparkles className="h-3.5 w-3.5" /> },
  { id: "Americas", label: "Americas" },
  { id: "Europe", label: "Europe" },
  { id: "Asia", label: "Asia" },
  { id: "MENA", label: "MENA" },
];

export const LanguageGrid = () => {
  const [selected, setSelected] = useState<string[]>(["EN", "ES", "FR", "JA", "PT"]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");

  const toggle = (c: string) =>
    setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LANGUAGES.filter((l) => {
      if (filter === "selected" && !selected.includes(l.code)) return false;
      if (filter === "popular" && !l.popular) return false;
      if (["Americas", "Europe", "Asia", "MENA"].includes(filter) && l.continent !== filter) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q)
      );
    });
  }, [query, filter, selected]);

  const counts: Record<FilterId, number> = useMemo(() => ({
    all: LANGUAGES.length,
    selected: selected.length,
    popular: LANGUAGES.filter((l) => l.popular).length,
    Americas: LANGUAGES.filter((l) => l.continent === "Americas").length,
    Europe: LANGUAGES.filter((l) => l.continent === "Europe").length,
    Asia: LANGUAGES.filter((l) => l.continent === "Asia").length,
    MENA: LANGUAGES.filter((l) => l.continent === "MENA").length,
  }), [selected]);

  const visibleCodes = filtered.map((l) => l.code);
  const allVisibleSelected = visibleCodes.length > 0 && visibleCodes.every((c) => selected.includes(c));
  const toggleAllVisible = () => {
    setSelected((s) =>
      allVisibleSelected
        ? s.filter((c) => !visibleCodes.includes(c))
        : Array.from(new Set([...s, ...visibleCodes]))
    );
  };

  return (
    <section className="container py-12">
      <SectionHeader
        step="02"
        title="Choose target languages"
        subtitle="Select up to 11 languages for simultaneous translation & dubbing."
        right={
          <div className="flex items-center gap-3 flex-wrap">
            <div className="glass rounded-full pl-3 pr-1 h-10 flex items-center gap-2 w-64 focus-within:border-accent/50 focus-within:shadow-glow transition-all">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search languages, codes, regions…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="h-7 w-7 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
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

      {/* Filter chips */}
      <div className="mt-6 flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`h-9 px-3.5 rounded-full text-xs flex items-center gap-1.5 transition-all ${
                active
                  ? "bg-gradient-primary text-white shadow-glow"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.icon}
              {f.label}
              <span className={`ml-1 font-mono text-[10px] px-1.5 py-0.5 rounded ${
                active ? "bg-white/20" : "bg-secondary/80"
              }`}>{counts[f.id]}</span>
            </button>
          );
        })}

        <span className="flex-1" />

        {filtered.length > 0 && (
          <button
            onClick={toggleAllVisible}
            className="h-9 px-3.5 rounded-full text-xs flex items-center gap-1.5 glass hover:border-accent/40 hover:text-accent transition-all"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {allVisibleSelected ? "Deselect visible" : "Select visible"}
          </button>
        )}
        {selected.length > 0 && (
          <button
            onClick={() => setSelected([])}
            className="h-9 px-3.5 rounded-full text-xs flex items-center gap-1.5 glass hover:border-destructive/50 hover:text-destructive transition-all"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-10 glass rounded-2xl p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center mb-3">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <h4 className="text-sm font-medium">No languages match “{query}”</h4>
          <p className="text-xs text-muted-foreground mt-1">Try a different name, code, or region.</p>
          <button
            onClick={() => { setQuery(""); setFilter("all"); }}
            className="mt-4 text-xs gradient-text font-medium"
          >Reset filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 mt-6">
          {filtered.map((l, i) => {
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
                {l.popular && !active && (
                  <span className="absolute top-3 right-3 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent/15 text-accent">
                    Popular
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div className="text-3xl leading-none">{l.flag}</div>
                  <div className="min-w-0">
                    <div className="text-[15px] font-medium truncate">
                      <Highlight text={l.name} query={query} />
                    </div>
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
      )}
    </section>
  );
};

const Highlight = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-accent/25 text-accent rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
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
