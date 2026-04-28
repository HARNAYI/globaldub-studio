import { Edit3, Download, MoreHorizontal, Film } from "lucide-react";
import { SectionHeader } from "./UploadArea";

const PROJECTS = [
  { title: "Brand launch keynote", langs: ["EN", "ES", "FR", "JA", "PT"], status: "Done", duration: "03:42", grad: "from-brand-purple to-brand-blue" },
  { title: "Product demo Q4", langs: ["EN", "DE", "ZH"], status: "Processing", duration: "01:58", grad: "from-brand-blue to-brand-cyan", progress: 64 },
  { title: "Onboarding tutorial", langs: ["EN", "ES", "HI", "AR"], status: "Done", duration: "05:12", grad: "from-brand-cyan to-brand-purple" },
  { title: "Investor pitch deck", langs: ["EN", "JA", "KO"], status: "Done", duration: "08:24", grad: "from-brand-purple to-brand-cyan" },
  { title: "Annual recap film", langs: ["EN", "ES", "FR", "DE", "IT", "PT", "JA", "KO", "ZH", "HI", "AR"], status: "Processing", duration: "12:01", grad: "from-brand-blue to-brand-purple", progress: 28 },
  { title: "Conference highlights", langs: ["EN", "FR", "DE"], status: "Done", duration: "06:33", grad: "from-brand-cyan to-brand-blue" },
];

export const ProjectsGrid = () => {
  return (
    <section className="container py-12 pb-24">
      <SectionHeader
        step="06"
        title="Recent projects"
        subtitle="Your studio, organized."
        right={
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all →
          </button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        {PROJECTS.map((p, i) => (
          <article
            key={p.title}
            style={{ animationDelay: `${i * 60}ms` }}
            className="group glass rounded-2xl p-3 hover:-translate-y-1 hover:shadow-elevated transition-all duration-500 animate-fade-in cursor-pointer"
          >
            {/* Thumbnail */}
            <div className={`relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br ${p.grad}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Film className="h-8 w-8 text-white/70" />
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                  <Edit3 className="h-4 w-4 text-white" />
                </button>
                <button className="h-9 w-9 rounded-full glass-strong flex items-center justify-center hover:text-accent">
                  <Download className="h-4 w-4" />
                </button>
                <button className="h-9 w-9 rounded-full glass-strong flex items-center justify-center">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              <div className="absolute top-2 left-2">
                <span className={`text-[10px] font-medium px-2 py-1 rounded-md backdrop-blur ${
                  p.status === "Done" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                }`}>
                  {p.status === "Processing" && (
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-warning mr-1 animate-pulse" />
                  )}
                  {p.status}
                </span>
              </div>
              <div className="absolute bottom-2 right-2 text-[10px] font-mono bg-background/70 backdrop-blur px-2 py-0.5 rounded">
                {p.duration}
              </div>

              {p.progress && (
                <div className="absolute bottom-0 inset-x-0 h-1 bg-background/40">
                  <div className="h-full bg-gradient-primary" style={{ width: `${p.progress}%` }} />
                </div>
              )}
            </div>

            <div className="p-3 pb-2">
              <h4 className="text-[15px] font-medium truncate">{p.title}</h4>
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                {p.langs.slice(0, 5).map((l) => (
                  <span key={l} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                    {l}
                  </span>
                ))}
                {p.langs.length > 5 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gradient-primary text-white">
                    +{p.langs.length - 5}
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
