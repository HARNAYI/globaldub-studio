import { Play, SkipBack, SkipForward, Volume2, Subtitles, Languages, ChevronDown, Maximize2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { SectionHeader } from "./UploadArea";
import { LANGUAGE_DATA, getCurrentSubtitle } from "@/lib/languageData";
import { ttsService } from "@/lib/ttsService";

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
  const [selectedLanguage, setSelectedLanguage] = useState("ES");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [lastSpokenSubtitle, setLastSpokenSubtitle] = useState("");
  const [isTTSSupported, setIsTTSSupported] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const subtitleCheckRef = useRef<NodeJS.Timeout>();

  const togglePlay = async () => {
    if (!videoRef.current || isProcessing) return;
    if (videoRef.current.paused) {
      if (audio === "dubbed") {
        videoRef.current.muted = true;
      } else {
        videoRef.current.muted = false;
      }
      await videoRef.current.play();
      setIsPlaying(true);
      setLastSpokenSubtitle(""); // Reset to allow re-speaking current subtitle
      return;
    }
    videoRef.current.pause();
    ttsService.stop();
    setIsPlaying(false);
  };

  const seekBy = (seconds: number) => {
    if (!videoRef.current || isProcessing) return;
    const newTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setLastSpokenSubtitle(""); // Reset to allow re-speaking subtitle at new position
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Check TTS support on mount
  useEffect(() => {
    setIsTTSSupported(ttsService.isSupported());
  }, []);

  // Speak current subtitle when it changes and TTS is enabled
  useEffect(() => {
    console.log(`TTS Effect - audio: ${audio}, isPlaying: ${isPlaying}, currentTime: ${currentTime}, currentSubtitle: "${currentSubtitle}", lastSpoken: "${lastSpokenSubtitle}"`);
    
    if (audio === "dubbed" && isPlaying && isTTSSupported && currentSubtitle && currentSubtitle !== lastSpokenSubtitle) {
      // Only start speaking after exactly 1 second of video
      if (currentTime >= 1) {
        console.log(`Starting TTS for "${currentSubtitle}" at time ${currentTime}`);
        
        // Clear any existing timeout
        if (subtitleCheckRef.current) {
          clearTimeout(subtitleCheckRef.current);
        }
        
        // Small delay to ensure smooth transitions
        subtitleCheckRef.current = setTimeout(() => {
          ttsService.speakText(currentSubtitle, selectedLanguage)
            .then(() => {
              setLastSpokenSubtitle(currentSubtitle);
              console.log(`Successfully spoke "${currentSubtitle}"`);
            })
            .catch((error) => {
              console.error('TTS Error:', error);
              // Still set as spoken to avoid infinite loops
              setLastSpokenSubtitle(currentSubtitle);
            });
        }, 100);
      } else {
        console.log(`Not starting TTS yet - current time ${currentTime} < 1 second`);
      }
    }
    
    return () => {
      if (subtitleCheckRef.current) {
        clearTimeout(subtitleCheckRef.current);
      }
    };
  }, [currentSubtitle, audio, isPlaying, selectedLanguage, lastSpokenSubtitle, isTTSSupported, currentTime]);

  // Continuous speech - restart TTS if it finishes early during subtitle duration
  useEffect(() => {
    if (audio === "dubbed" && isPlaying && isTTSSupported && currentSubtitle && lastSpokenSubtitle === currentSubtitle && currentTime >= 1) {
      // Check if we need to restart speaking (in case TTS finished early)
      const currentSubtitleData = LANGUAGE_DATA[selectedLanguage]?.subtitles.find(
        sub => currentTime >= sub.start && currentTime < sub.end
      );
      
      if (currentSubtitleData && currentSubtitleData.text === currentSubtitle) {
        // We're still in the same subtitle segment, ensure TTS continues
        const remainingTime = currentSubtitleData.end - currentTime;
        console.log(`Continuous speech check - remaining time: ${remainingTime}, subtitle: "${currentSubtitle}"`);
        
        if (remainingTime > 3.0) { // Only restart if more than 3 seconds remaining
          if (subtitleCheckRef.current) {
            clearTimeout(subtitleCheckRef.current);
          }
          
          console.log(`Restarting TTS for "${currentSubtitle}" with ${remainingTime}s remaining`);
          
          subtitleCheckRef.current = setTimeout(() => {
            ttsService.speakText(currentSubtitle, selectedLanguage)
              .then(() => {
                console.log(`Successfully restarted "${currentSubtitle}"`);
              })
              .catch((error) => {
                console.error('TTS Restart Error:', error);
              });
          }, 2000); // Restart after 2 seconds to match very slow speech
        }
      }
    }
  }, [currentTime, currentSubtitle, lastSpokenSubtitle, audio, isPlaying, selectedLanguage, isTTSSupported]);

  // Stop TTS when video stops or language changes
  useEffect(() => {
    if (!isPlaying || audio !== "dubbed") {
      ttsService.stop();
      setLastSpokenSubtitle("");
    }
  }, [isPlaying, audio]);

  // Update subtitle based on current time and language
  useEffect(() => {
    if (audio === "dubbed" && subs) {
      const subtitle = getCurrentSubtitle(selectedLanguage, currentTime);
      setCurrentSubtitle(subtitle);
    } else {
      // Use original subtitle when not dubbed or subtitles are off
      setCurrentSubtitle(subs ? subtitle : "");
    }
  }, [currentTime, selectedLanguage, audio, subs, subtitle]);

  // Update audio source when language changes (not needed for TTS but keeping for consistency)
  useEffect(() => {
    if (audio === "dubbed") {
      setLastSpokenSubtitle(""); // Reset to speak new language
    }
  }, [selectedLanguage, audio]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showLanguageDropdown && !target.closest('.language-selector-container')) {
        setShowLanguageDropdown(false);
      }
    };

    if (showLanguageDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showLanguageDropdown]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || isProcessing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * duration;
    videoRef.current.currentTime = newTime;
    setLastSpokenSubtitle(""); // Reset to allow re-speaking subtitle at new position
  };

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
              muted={audio === "dubbed"}
              onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
              onTimeUpdate={() => {
                const current = videoRef.current?.currentTime ?? 0;
                setCurrentTime(current);
              }}
              onPlay={() => {
                setIsPlaying(true);
              }}
              onPause={() => {
                setIsPlaying(false);
                ttsService.stop();
              }}
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
            {subs && currentSubtitle && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-background/80 backdrop-blur text-sm text-center max-w-[80%]">
                <span className="text-white">{currentSubtitle}</span>
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

            <div className="absolute top-4 left-4 glass-strong px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs language-selector-container">
              <Languages className="h-3.5 w-3.5 text-brand-cyan" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLanguageDropdown(!showLanguageDropdown);
                }}
                className="flex items-center gap-2 hover:text-accent transition-colors"
              >
                <span>{audio === "dubbed" ? LANGUAGE_DATA[selectedLanguage]?.displayName || "Spanish (ES)" : "Original Audio"}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${showLanguageDropdown ? "rotate-180" : ""}`} />
              </button>
              {showLanguageDropdown && audio === "dubbed" && (
                <div 
                  className="absolute top-full left-0 mt-1 glass-strong rounded-lg py-1 min-w-[140px] z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  {["ES", "FR", "JA", "PT", "EN"].map((lang) => (
                    <button
                      key={lang}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLanguage(lang);
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs hover:bg-accent/20 transition-colors ${
                        selectedLanguage === lang ? "text-accent" : ""
                      }`}
                    >
                      {LANGUAGE_DATA[lang]?.displayName || lang}
                    </button>
                  ))}
                </div>
              )}
              {audio === "dubbed" && !isTTSSupported && (
                <div className="absolute -top-8 left-0 text-[10px] text-orange-500 whitespace-nowrap">
                  TTS not supported in this browser
                </div>
              )}
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
            <div 
              className="flex-1 h-1.5 rounded-full bg-secondary relative overflow-hidden cursor-pointer"
              onClick={handleProgressClick}
            >
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
                  onClick={() => {
                    setAudio(m);
                    if (m === "original") {
                      ttsService.stop();
                      setLastSpokenSubtitle("");
                      if (videoRef.current) {
                        videoRef.current.muted = false;
                      }
                    } else if (m === "dubbed" && videoRef.current) {
                      videoRef.current.muted = true;
                      setLastSpokenSubtitle(""); // Reset to speak current subtitle
                    }
                  }}
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
