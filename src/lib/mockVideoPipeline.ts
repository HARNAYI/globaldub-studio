export type VideoSourceType = "file" | "url" | "demo";
export type VideoStatus = "processing" | "ready";

export type VideoAsset = {
  id: string;
  title: string;
  videoUrl: string;
  sourceType: VideoSourceType;
  durationLabel: string;
  sizeLabel: string;
  resolutionLabel: string;
  subtitle: string;
  status: VideoStatus;
  progress: number;
};

const DEMO_VIDEO_URL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export const demoVideoAsset: VideoAsset = {
  id: "demo-video",
  title: "globaldub_demo_reel.mp4",
  videoUrl: DEMO_VIDEO_URL,
  sourceType: "demo",
  durationLabel: "00:30",
  sizeLabel: "2.9 MB",
  resolutionLabel: "720p",
  subtitle: "Bienvenidos al futuro de la localizacion de video",
  status: "ready",
  progress: 100,
};

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function runMockProcessing(onProgress: (value: number) => void) {
  for (let step = 8; step <= 100; step += 8) {
    onProgress(Math.min(100, step));
    await sleep(170);
  }
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "Unknown size";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export async function processUploadedFile(
  file: File,
  objectUrl: string,
  onProgress: (value: number) => void,
): Promise<VideoAsset> {
  await runMockProcessing(onProgress);

  return {
    id: `file-${Date.now()}`,
    title: file.name,
    videoUrl: objectUrl,
    sourceType: "file",
    durationLabel: "00:30",
    sizeLabel: formatBytes(file.size),
    resolutionLabel: "1080p",
    subtitle: "Bienvenidos al futuro de la localizacion de video",
    status: "ready",
    progress: 100,
  };
}

export async function processImportedUrl(
  sourceUrl: string,
  onProgress: (value: number) => void,
): Promise<VideoAsset> {
  let parsed: URL;
  try {
    parsed = new URL(sourceUrl);
  } catch {
    throw new Error("Please enter a valid video URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http(s) URLs are supported.");
  }

  await runMockProcessing(onProgress);

  return {
    id: `url-${Date.now()}`,
    title: `Imported from ${parsed.hostname}`,
    videoUrl: DEMO_VIDEO_URL,
    sourceType: "url",
    durationLabel: "00:30",
    sizeLabel: "Stream",
    resolutionLabel: "720p",
    subtitle: "Bienvenidos al futuro de la localizacion de video",
    status: "ready",
    progress: 100,
  };
}
