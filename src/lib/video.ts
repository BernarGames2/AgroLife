/** Interpreta o link de um vídeo enviado pela equipe KP para exibi-lo no app. */

export type VideoSource =
  | { kind: "embed"; src: string; provider: "YouTube" | "Google Drive" | "Vimeo" }
  | { kind: "file"; src: string }
  | { kind: "link"; src: string };

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

const YOUTUBE_ID = /^[\w-]{11}$/;

export function parseVideoUrl(value: string): VideoSource | null {
  if (!isHttpUrl(value)) return null;
  const url = new URL(value.trim());
  const host = url.hostname.replace(/^(www|m)\./, "");

  if (host === "youtu.be" || host === "youtube.com" || host === "youtube-nocookie.com") {
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0];
    else if (url.pathname === "/watch") id = url.searchParams.get("v");
    else {
      const m = url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/);
      id = m ? m[1] : null;
    }
    if (id && YOUTUBE_ID.test(id)) return { kind: "embed", provider: "YouTube", src: `https://www.youtube-nocookie.com/embed/${id}` };
  }

  if (host === "drive.google.com") {
    const m = url.pathname.match(/\/file\/d\/([\w-]+)/);
    const id = m ? m[1] : url.searchParams.get("id");
    if (id && /^[\w-]+$/.test(id)) return { kind: "embed", provider: "Google Drive", src: `https://drive.google.com/file/d/${id}/preview` };
  }

  if (host === "vimeo.com") {
    const m = url.pathname.match(/^\/(\d+)/);
    if (m) return { kind: "embed", provider: "Vimeo", src: `https://player.vimeo.com/video/${m[1]}` };
  }

  if (/\.(mp4|webm|mov|m4v)$/i.test(url.pathname)) return { kind: "file", src: url.toString() };

  return { kind: "link", src: url.toString() };
}
