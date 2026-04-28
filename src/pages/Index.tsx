import { Navbar } from "@/components/globaldub/Navbar";
import { Hero } from "@/components/globaldub/Hero";
import { UploadArea } from "@/components/globaldub/UploadArea";
import { LanguageGrid } from "@/components/globaldub/LanguageGrid";
import { VoiceSelector } from "@/components/globaldub/VoiceSelector";
import { PreviewStudio } from "@/components/globaldub/PreviewStudio";
import { SettingsExport } from "@/components/globaldub/SettingsExport";
import { ProjectsGrid } from "@/components/globaldub/ProjectsGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <UploadArea />
        <LanguageGrid />
        <VoiceSelector />
        <PreviewStudio />
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
