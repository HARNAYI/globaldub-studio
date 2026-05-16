import { Navbar } from "@/components/globaldub/Navbar";
import { Hero } from "@/components/globaldub/Hero";
import { UploadArea } from "@/components/globaldub/UploadArea";
import { LanguageGrid } from "@/components/globaldub/LanguageGrid";
import { VoiceSelector } from "@/components/globaldub/VoiceSelector";
import { PreviewStudio } from "@/components/globaldub/PreviewStudio";
import { SettingsExport } from "@/components/globaldub/SettingsExport";
import { ProjectsGrid } from "@/components/globaldub/ProjectsGrid";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  demoVideoAsset,
  processImportedUrl,
  processUploadedFile,
  type VideoAsset,
} from "@/lib/mockVideoPipeline";
import { transcribeAudio, translateText, generateVoice } from "@/lib/dubbingService";
import { uploadVideo } from "@/lib/supabase";

const Index = () => {
  const [videoAsset, setVideoAsset] = useState<VideoAsset>(demoVideoAsset);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDubbing, setIsDubbing] = useState(false);
  const [dubbedAudioUrl, setDubbedAudioUrl] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const startProcessing = () => {
    setIsProcessing(true);
    setVideoAsset((prev) => ({ ...prev, status: "processing", progress: 0 }));
  };

  const finishProcessing = (nextAsset: VideoAsset) => {
    setVideoAsset(nextAsset);
    setIsProcessing(false);
  };

  const handleDubVideo = async () => {
    if (!videoAsset || isDubbing) return;
    try {
      setIsDubbing(true);
      toast.info("Transcribing audio...");

      const response = await fetch(videoAsset.videoUrl);
      const audioBlob = await response.blob();

      const { text, language } = await transcribeAudio(audioBlob);
      toast.info(Translating from ${language}...);

      const translated = await translateText(text, language, selectedLanguage);
      toast.info("Generating voice...");

      const audioResult = await generateVoice(translated);
      const url = URL.createObjectURL(audioResult);
      setDubbedAudioUrl(url);

      toast.success("Dubbing complete!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Dubbing failed";
      toast.error(message);
    } finally {
      setIsDubbing(false);
    }
  };

  const handleFileSelected = async (file: File) => {
    try {
      startProcessing();

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      const objectUrl = URL.createObjectURL(file);
      const supabaseUrl = await uploadVideo(file);

      objectUrlRef.current = objectUrl;
      setVideoAsset((prev) => ({
        ...prev,
        title: file.name,
        sourceType: "file",
        status: "processing",
        progress: 0,
        videoUrl: supabaseUrl ?? objectUrl,
      }));

      const processed = await processUploadedFile(file, objectUrl, (progress) => {
        setVideoAsset((prev) => ({ ...prev, progress, status: "processing" }));
      });

      finishProcessing({
        ...processed,
        videoUrl: supabaseUrl ?? processed.videoUrl,
      });
      toast.success("Video uploaded and processed.");
    } catch (error) {
      setIsProcessing(false);
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    }
  };

  const handleImportUrl = async (url: string) => {
    try {
      startProcessing();
      setVideoAsset((prev) => ({
        ...prev,
        sourceType: "url",
        title: "Importing video...",
        status: "processing",
        progress: 0,
      }));

      const processed = await processImportedUrl(url, (progress) => {
        setVideoAsset((prev) => ({ ...prev, progress, status: "processing" }));
      });

      finishProcessing(processed);
      toast.success("Video URL imported successfully.");
    } catch (error) {
      setIsProcessing(false);
      const message = error instanceof Error ? error.message : "Import failed";
      toast.error(message);
    }
  };

  const handleClearVideo = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setVideoAsset(demoVideoAsset);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <UploadArea
          videoAsset={videoAsset}
          isProcessing={isProcessing}
          onFileSelected={handleFileSelected}
          onImportUrl={handleImportUrl}
          onClear={handleClearVideo}
        />
        <LanguageGrid />
        <div className="container py-6 flex justify-center">
          <button
            onClick={handleDubVideo}
            disabled={isDubbing || isProcessing}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-medium text-sm shadow-lg hover:opacity-90 disabled:opacity-50 transition"
          >
            {isDubbing ? "Dubbing..." : "🎙️ Dub Now"}
          </button>
        </div>
        {dubbedAudioUrl && (
          <div className="container py-4 flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">Dubbed Audio Result:</p>
            <audio controls src={dubbedAudioUrl} className="w-full max-w-md" />
            <a
              href={dubbedAudioUrl}
              download="dubbed-audio.mp3"
              className="px-6 py-2 rounded-full bg-green-500 text-white text-sm hover:opacity-90"
            >
              ⬇️ Download Audio
            </a>
          </div>
        )}
        <VoiceSelector />
        <PreviewStudio
          videoUrl={videoAsset.videoUrl}
          title={videoAsset.title}
          subtitle={videoAsset.subtitle}
          isProcessing={isProcessing}
          progress={videoAsset.progress}
          durationLabel={videoAsset.durationLabel}
        />
        <SettingsExport />
        <ProjectsGrid />
      </main>
      <footer className="border-t border-border/60">
        <div className="container py-8 flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2026 GlobalDub AI · Studio v3.2</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            All systems operational
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Index;