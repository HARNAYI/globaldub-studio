import { Play, SkipBack, SkipForward, Volume2, Subtitles, Languages, ChevronDown, Maximize2 } from "lucide-react";
import { useRef, useState } from "react";
import { SectionHeader } from "./UploadArea";

type PreviewStudioProps = {
  videoUrl: string;
  title: string;
  subtitle: string;
  durationLabel: string;
  isProcessing: boolean;
  progress: number;
};

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export const PreviewStudio = ({
  videoUrl,
  title,
  subtitle,
  durationLabel,
  isProcessing,
  progress,
}: PreviewStudioProps) => {
  const [audio, setAudio] = useState<"original" | "dubbed">("dubbed");
  const [subs, setSubs] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = async () => {
    if (!videoRef.current || isProcessing) return;
    if (videoRef.current.paused) {
      await videoRef.current.play();
      setIsPlaying(true);
      return;
    }
    videoRef.current.pause();
    setIsPlaying(false);
  };

  const seekBy = (seconds: number) => {
    if (!videoRef.current || isProcessing) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds));
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section id="try-demo" className="container py-12">
      <SectionHeader step="04" title="Preview & fine-tune" subtitle="Switch languages, toggle subtitles, scrub the timeline." />

      <div className="grid lg:grid-cols-3 gap-5 mt-8">
        {/* Player */}
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-brand-purple/50 via-brand-blue/40 to-brand-cyan/40">
            <video
              ref={videoRef}
              src={videoUrl}
              className="absolute inset-0 h-full w-full object-cover"
              playsInline
              onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
              onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--brand-cyan)/0.4),transparent_50%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                onClick={togglePlay}
                className="h-16 w-16 rounded-full bg-white/95 text-background flex items-center justify-center shadow-elevated hover:scale-110 transition"
              >
                <Play className={`h-6 w-6 fill-current ${isPlaying ? "" : "ml-0.5"}`} />
              </button>
            </div>

            {/* Subtitle overlay */}
            {subs && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-background/80 backdrop-blur text-sm text-center max-w-[80%]">
                <span className="text-white">{subtitle}</span>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
                <div className="w-[70%]">
                  <p className="text-xs text-center text-muted-foreground mb-2">Processing video... {progress}%</p>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            )}

            <div className="absolute top-4 right-4 flex gap-2">
              <span className="glass-strong px-2.5 py-1 rounded-md text-[10px] font-mono">LIVE PREVIEW</span>
              <button className="h-7 w-7 rounded-md glass-strong flex items-center justify-center">
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="absolute top-4 left-4 glass-strong px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
              <Languages className="h-3.5 w-3.5 text-brand-cyan" />
              <span>{audio === "dubbed" ? "Spanish (ES)" : "Original Audio"}</span>
              <ChevronDown className="h-3 w-3" />
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center gap-3">
            <button type="button" onClick={() => seekBy(-5)} className="h-9 w-9 rounded-full glass flex items-center justify-center"><SkipBack className="h-4 w-4" /></button>
            <button type="button" onClick={togglePlay} className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
              <Play className="h-4 w-4 text-white fill-white ml-0.5" />
            </button>
            <button type="button" onClick={() => seekBy(5)} className="h-9 w-9 rounded-full glass flex items-center justify-center"><SkipForward className="h-4 w-4" /></button>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {formatDuration(currentTime)} / {duration > 0 ? formatDuration(duration) : durationLabel}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-secondary relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-gradient-primary rounded-full" style={{ width: `${progressPercent}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 h-3 w-3 -ml-1.5 rounded-full bg-white shadow-glow" style={{ left: `${progressPercent}%` }} />
            </div>
            <Volume2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground truncate">{title}</p>

          {/* Audio toggle */}
          <div className="mt-4 flex items-center gap-2">
            <div className="glass rounded-full p-1 flex">
              {(["original", "dubbed"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setAudio(m)}
                  className={`px-4 h-8 rounded-full text-xs capitalize transition-all ${
                    audio === m ? "bg-gradient-primary text-white shadow-glow" : "text-muted-foreground"
                  }`}
                >
                  {m} audio
                </button>
              ))}
            </div>
            <button
              onClick={() => setSubs(!subs)}
              className={`h-9 px-3 rounded-full glass flex items-center gap-2 text-xs transition-colors ${
                subs ? "text-accent border-accent/40" : "text-muted-foreground"
              }`}
            >
              <Subtitles className="h-3.5 w-3.5" /> Subtitles {subs ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium">Timeline</h4>
            <span className="text-[10px] font-mono text-muted-foreground">5 TRACKS</span>
          </div>
          <div className="space-y-3">
            {[
              { name: "Original Audio", c: "from-muted-foreground/40 to-muted-foreground/20" },
              { name: "EN · Aurora", c: "from-brand-purple to-brand-blue" },
              { name: "ES · Sofia", c: "from-brand-blue to-brand-cyan" },
              { name: "JA · Hana", c: "from-brand-cyan to-brand-purple" },
              { name: "Subtitles", c: "from-accent/60 to-accent/30" },
            ].map((t, i) => (
              <div key={t.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{t.name}</span>
                  <span className="font-mono text-muted-foreground/60">03:42</span>
                </div>
                <div className="h-7 rounded-md bg-secondary/60 relative overflow-hidden">
                  <div className={`absolute inset-y-1 left-1 right-1 rounded bg-gradient-to-r ${t.c}`}>
                    <div className="h-full flex items-center gap-0.5 px-2">
                      {Array.from({ length: 30 }).map((_, k) => (
                        <span
                          key={k}
                          className="flex-1 bg-white/30 rounded-sm"
                          style={{ height: `${30 + Math.abs(Math.sin(k * 0.7 + i)) * 60}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
