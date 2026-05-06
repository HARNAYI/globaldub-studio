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

const Index = () => {
  const [videoAsset, setVideoAsset] = useState<VideoAsset>(demoVideoAsset);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleFileSelected = async (file: File) => {
    try {
      startProcessing();

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;
      setVideoAsset((prev) => ({
        ...prev,
        title: file.name,
        sourceType: "file",
        status: "processing",
        progress: 0,
      }));

      const processed = await processUploadedFile(file, objectUrl, (progress) => {
        setVideoAsset((prev) => ({ ...prev, progress, status: "processing" }));
      });

      finishProcessing(processed);
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
