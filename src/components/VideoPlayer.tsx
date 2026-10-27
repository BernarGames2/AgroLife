import { ExternalLink } from "lucide-react";
import { parseVideoUrl } from "@/lib/video";
import { ButtonAnchor } from "@/components/ui/Button";

export function VideoPlayer({ url, title }: { url: string; title: string }) {
  const source = parseVideoUrl(url);
  if (!source) return null;

  if (source.kind === "embed") {
    return (
      <div className="aspect-video overflow-hidden rounded-2xl border bg-black">
        <iframe
          src={source.src}
          title={title}
          className="h-full w-full"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
        />
      </div>
    );
  }

  if (source.kind === "file") {
    return <video src={source.src} controls playsInline preload="metadata" className="aspect-video w-full rounded-2xl border bg-black" title={title} />;
  }

  return (
    <ButtonAnchor href={source.src} target="_blank" rel="noopener noreferrer" variant="outline">
      <ExternalLink /> Abrir vídeo
    </ButtonAnchor>
  );
}
