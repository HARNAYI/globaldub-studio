import { UploadCloud, Link2, Film, Clock, HardDrive, X } from "lucide-react";
import { useRef, useState } from "react";
import { type VideoAsset } from "@/lib/mockVideoPipeline";

type UploadAreaProps = {
  videoAsset: VideoAsset;
  isProcessing: boolean;
  onFileSelected: (file: File) => void;
  onImportUrl: (url: string) => void;
  onClear: () => void;
};

export const UploadArea = ({
  videoAsset,
  isProcessing,
  onFileSelected,
  onImportUrl,
  onClear,
}: UploadAreaProps) => {
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrowseFiles = () => {
    if (isProcessing) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    event.currentTarget.value = "";
  };

  const handleImportClick = () => {
    if (!urlInput.trim() || isProcessing) return;
    onImportUrl(urlInput.trim());
  };

  return (
    <section id="upload-video" className="container py-12">
      <SectionHeader step="01" title="Upload your video" subtitle="Drag a file or paste a URL — we handle the rest." />

      <div className="grid lg:grid-cols-3 gap-5 mt-8">
        {/* Drop zone */}
        <div className="lg:col-span-2">
          <div className="group relative rounded-2xl glass p-1 transition-all duration-500 hover:shadow-glow">
            <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            <div className="relative rounded-2xl border-2 border-dashed border-border group-hover:border-accent/60 bg-background-elevated/40 p-12 text-center transition-all">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-primary-soft flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <UploadCloud className="h-7 w-7 text-brand-cyan" />
              </div>
              <h3 className="text-lg font-medium">Drop your video here</h3>
              <p className="text-sm text-muted-foreground mt-1.5">
                MP4, MOV, WebM up to 5 GB · max 4 hours
              </p>
              <button
                type="button"
                onClick={handleBrowseFiles}
                disabled={isProcessing}
                className="mt-6 inline-flex items-center gap-2 px-5 h-10 rounded-full bg-gradient-primary text-white text-sm shadow-glow-purple hover:opacity-90 transition"
              >
                {isProcessing ? "Processing..." : "Browse files"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* URL input */}
              <div className="mt-7 flex items-center gap-2 max-w-md mx-auto glass rounded-full pl-4 pr-1.5 h-11 border border-border/60">
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleImportClick();
                  }}
                  placeholder="Or paste YouTube, Drive, Vimeo URL…"
                  className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/70 outline-none"
                />
                <button
                  type="button"
                  onClick={handleImportClick}
                  disabled={isProcessing || !urlInput.trim()}
                  className="h-8 px-4 rounded-full bg-accent text-accent-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* File card */}
        {videoAsset && (
          <div className="glass rounded-2xl p-5 relative animate-scale-in min-h-[280px]">
            <button
              onClick={onClear}
              type="button"
              className="absolute top-3 right-3 h-7 w-7 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="aspect-video rounded-xl bg-gradient-to-br from-brand-purple/40 via-brand-blue/30 to-brand-cyan/30 relative overflow-hidden flex items-center justify-center">
              <video
                src={videoAsset.videoUrl}
                className="absolute inset-0 h-full w-full object-cover opacity-80"
                muted
                playsInline
              />
              <Film className="h-10 w-10 text-white/80 relative z-10" />
              <div className="absolute bottom-2 right-2 text-[10px] font-mono bg-background/70 backdrop-blur px-2 py-0.5 rounded">
                {videoAsset.durationLabel}
              </div>
            </div>
            <h4 className="mt-4 text-sm font-medium truncate">{videoAsset.title}</h4>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {videoAsset.durationLabel}</span>
              <span className="flex items-center gap-1"><HardDrive className="h-3 w-3" /> {videoAsset.sizeLabel}</span>
              <span className="flex items-center gap-1"><Film className="h-3 w-3" /> {videoAsset.resolutionLabel}</span>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-[11px] mb-1.5">
                <span className="text-muted-foreground">
                  {isProcessing ? "Analyzing audio..." : "Ready for dubbing"}
                </span>
                <span className="text-accent font-medium">{videoAsset.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-gradient-primary rounded-full relative"
                  style={{ width: `${videoAsset.progress}%` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] bg-[length:200%_100%] animate-shimmer" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export const SectionHeader = ({
  step,
  title,
  subtitle,
  right,
}: {
  step: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) => (
  <div className="flex items-end justify-between gap-4 flex-wrap">
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-[11px] text-accent tracking-widest">STEP {step}</span>
        <span className="h-px w-8 bg-border" />
      </div>
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>}
    </div>
    {right}
  </div>
);
