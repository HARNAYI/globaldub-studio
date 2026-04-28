import { Upload, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Mesh background */}
      <div className="absolute inset-0 mesh-bg opacity-80 animate-gradient-shift" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,hsl(var(--background))_70%)]" aria-hidden />

      {/* Floating orbs */}
      <div className="absolute top-20 left-[10%] h-64 w-64 rounded-full bg-brand-purple/30 blur-3xl animate-float" />
      <div className="absolute top-40 right-[8%] h-72 w-72 rounded-full bg-brand-cyan/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="container relative pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-3xl mx-auto text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-6">
            <Sparkles className="h-3.5 w-3.5 text-brand-cyan" />
            <span className="text-xs text-muted-foreground">Powered by neural voice synthesis</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="text-xs gradient-text font-medium">v3.2 released</span>
          </div>

          <h1 className="text-balance text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05]">
            Translate & dub videos into{" "}
            <span className="gradient-text">11 languages</span>{" "}
            instantly
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Studio-grade AI voices, native accents, perfect lip-sync. Localize your content for the world in minutes — not weeks.
          </p>

          <div className="mt-9 flex items-center justify-center gap-3 flex-wrap">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-white border-0 shadow-glow-purple rounded-full h-12 px-6 gap-2 text-[15px]">
              <Upload className="h-4 w-4" /> Upload Video
            </Button>
            <Button size="lg" variant="outline" className="glass border-border hover:border-accent/50 hover:text-accent rounded-full h-12 px-6 gap-2 text-[15px] bg-transparent">
              <Play className="h-4 w-4" /> Try Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-3 gap-6 max-w-xl mx-auto">
            {[
              { v: "11", l: "Languages" },
              { v: "47+", l: "AI Voices" },
              { v: "99.2%", l: "Sync Accuracy" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-2xl md:text-3xl font-semibold gradient-text">{s.v}</div>
                <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
