import { Bell, Plus, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const tabs = ["Dashboard", "Projects", "Templates", "Pricing"];

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass-strong border-b border-border/60">
        <nav className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary blur-md opacity-60 group-hover:opacity-90 transition-opacity rounded-xl" />
              <div className="relative h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Globe2 className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-semibold tracking-tight">GlobalDub<span className="text-brand-cyan"> AI</span></span>
              <span className="text-[10px] text-muted-foreground tracking-widest uppercase">Dubbing Studio</span>
            </div>
          </a>

          {/* Tabs */}
          <div className="hidden md:flex items-center gap-1 glass rounded-full p-1">
            {tabs.map((t, i) => (
              <button
                key={t}
                className={`px-4 py-1.5 text-sm rounded-full transition-all duration-300 ${
                  i === 0
                    ? "bg-gradient-primary text-white shadow-glow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <button className="relative h-9 w-9 rounded-full glass flex items-center justify-center hover:border-accent/40 transition-all">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-cyan shadow-glow animate-pulse-glow" />
            </button>
            <Button className="hidden sm:inline-flex bg-gradient-primary hover:opacity-90 text-white border-0 shadow-glow-purple rounded-full px-4 h-9 gap-1.5">
              <Plus className="h-4 w-4" /> New Project
            </Button>
            <div className="h-9 w-9 rounded-full bg-gradient-primary p-[2px]">
              <div className="h-full w-full rounded-full bg-card flex items-center justify-center text-xs font-semibold">
                AS
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};
