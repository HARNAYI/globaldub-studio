import { Sparkles, Sliders, Download, Loader2, Type, Square } from "lucide-react";
import { useState } from "react";
import { SectionHeader } from "./UploadArea";
import { PaymentGateModal } from "./PaymentGateModal";
import { useX402DownloadGate } from "@/hooks/useX402DownloadGate";

export const SettingsExport = () => {
  const [speed, setSpeed] = useState(1);
  const [tone, setTone] = useState<"formal" | "casual">("casual");
  const [fontSize, setFontSize] = useState(16);
  const [bgBox, setBgBox] = useState(true);
  const [sync, setSync] = useState(true);
  const [resolution, setResolution] = useState("1080p");
  const [format, setFormat] = useState("MP4");
  const [exportMode, setExportMode] = useState<"single" | "batch">("batch");
  const [processing, setProcessing] = useState(false);
  const gate = useX402DownloadGate();
  const assetId = "project-editor-export";

  const handleGenerateClick = () => {
    if (!gate.canDownload) {
      gate.openGate();
      return;
    }
    setProcessing((prev) => !prev);
  };

  return (
    <section className="container py-12">
      <SectionHeader step="05" title="Settings & export" subtitle="Polish the final mix, then ship to all 11 languages." />

      <div className="grid lg:grid-cols-2 gap-5 mt-8">
        {/* Settings */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Sliders className="h-4 w-4 text-brand-cyan" />
            <h3 className="font-medium">Voice & subtitle settings</h3>
          </div>

          <div className="space-y-6">
            {/* Speed */}
            <Field label="Voice speed" value={`${speed.toFixed(2)}x`}>
              <input
                type="range" min={0.5} max={1.5} step={0.05}
                value={speed} onChange={(e) => setSpeed(+e.target.value)}
                className="w-full accent-brand-cyan"
              />
            </Field>

            {/* Tone */}
            <Field label="Tone">
              <div className="glass rounded-full p-1 flex">
                {(["formal", "casual"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`flex-1 h-8 rounded-full text-xs capitalize transition ${
                      tone === t ? "bg-gradient-primary text-white shadow-glow" : "text-muted-foreground"
                    }`}
                  >{t}</button>
                ))}
              </div>
            </Field>

            {/* Subtitle */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Font size" value={`${fontSize}px`}>
                <input
                  type="range" min={12} max={28} value={fontSize}
                  onChange={(e) => setFontSize(+e.target.value)}
                  className="w-full accent-brand-cyan"
                />
              </Field>
              <Field label="Subtitle BG box">
                <Toggle active={bgBox} onClick={() => setBgBox(!bgBox)} icon={<Square className="h-3 w-3" />} />
              </Field>
            </div>

            <Field label="Audio sync (lip-match)">
              <Toggle active={sync} onClick={() => setSync(!sync)} icon={<Type className="h-3 w-3" />} />
            </Field>
          </div>
        </div>

        {/* Export */}
        <div className="glass rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-brand-purple/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-5">
              <Download className="h-4 w-4 text-brand-cyan" />
              <h3 className="font-medium">Export</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {([
                { id: "single", title: "Single language", sub: "Pick one" },
                { id: "batch", title: "Multi-language batch", sub: "All 5 at once" },
              ] as const).map((o) => (
                <button
                  key={o.id}
                  onClick={() => setExportMode(o.id)}
                  className={`text-left p-4 rounded-xl transition-all ${
                    exportMode === o.id ? "gradient-border shadow-glow" : "glass hover:-translate-y-0.5"
                  }`}
                >
                  <div className="text-sm font-medium">{o.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{o.sub}</div>
                </button>
              ))}
            </div>

            <Field label="Resolution">
              <div className="flex gap-2">
                {["720p", "1080p", "4K"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setResolution(r)}
                    className={`flex-1 h-9 rounded-lg text-xs transition ${
                      resolution === r ? "bg-gradient-primary text-white shadow-glow" : "glass text-muted-foreground"
                    }`}
                  >{r}</button>
                ))}
              </div>
            </Field>

            <div className="mt-4">
              <Field label="Format">
                <div className="flex gap-2">
                  {["MP4", "MOV"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`flex-1 h-9 rounded-lg text-xs font-mono transition ${
                        format === f ? "bg-gradient-primary text-white shadow-glow" : "glass text-muted-foreground"
                      }`}
                    >{f}</button>
                  ))}
                </div>
              </Field>
            </div>

            <button
              onClick={handleGenerateClick}
              className="mt-6 w-full h-12 rounded-xl bg-gradient-primary text-white font-medium shadow-glow-purple hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing AI dubbing…
                </>
              ) : !gate.canDownload ? (
                <>
                  <Sparkles className="h-4 w-4" /> Unlock export with SOL/USDC
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate dubbed video
                </>
              )}
            </button>

            {processing && (
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="relative h-8 w-8">
                  <svg viewBox="0 0 36 36" className="h-8 w-8 -rotate-90">
                    <circle cx="18" cy="18" r="15" stroke="hsl(var(--secondary))" strokeWidth="3" fill="none" />
                    <circle cx="18" cy="18" r="15" stroke="hsl(var(--accent))" strokeWidth="3" fill="none"
                      strokeDasharray="94.2" strokeDashoffset="35" strokeLinecap="round" />
                  </svg>
                </div>
                Rendering 5 languages · ~2 min remaining
              </div>
            )}
          </div>
        </div>
      </div>

      <PaymentGateModal
        open={gate.isOpen}
        assetId={assetId}
        onOpenChange={(open) => {
          if (open) gate.openGate();
          else gate.closeGate();
        }}
        onStatusChange={(status, error) => {
          gate.markStatus(status);
          if (status === "failed" && error) gate.markFailed(error);
          if (status === "expired") gate.markExpired();
        }}
        onUnlocked={(receiptJwt) => {
          gate.markConfirmed(receiptJwt);
          setProcessing(true);
        }}
      />
    </section>
  );
};

const Field = ({ label, value, children }: { label: string; value?: string; children: React.ReactNode }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</label>
      {value && <span className="text-xs font-mono text-accent">{value}</span>}
    </div>
    {children}
  </div>
);

const Toggle = ({ active, onClick, icon }: { active: boolean; onClick: () => void; icon?: React.ReactNode }) => (
  <button onClick={onClick} className={`h-9 px-3 rounded-lg glass flex items-center justify-between w-full text-xs ${active ? "text-accent" : "text-muted-foreground"}`}>
    <span className="flex items-center gap-2">{icon} {active ? "Enabled" : "Disabled"}</span>
    <span className={`inline-flex h-5 w-9 rounded-full transition-colors items-center px-0.5 ${active ? "bg-gradient-primary" : "bg-secondary"}`}>
      <span className={`h-4 w-4 rounded-full bg-white transition-transform ${active ? "translate-x-4" : ""}`} />
    </span>
  </button>
);
