import { describe, expect, it } from "vitest";
import type { KpRequest } from "@/types";
import { createDemoFields, DEMO_PROFILE } from "@/lib/demo";
import { kpMessage, kpRequestStatus } from "@/lib/kp";
import { formatPrice, hasPlan, PLAN_ORDER, PLANS } from "@/lib/plans";
import { parseAppData } from "@/lib/storage";
import { parseVideoUrl } from "@/lib/video";

describe("planos", () => {
  it("seguem a ordem Gratuito < Plus < Premium com os preços definidos", () => {
    expect(PLAN_ORDER).toEqual(["gratuito", "plus", "premium"]);
    expect(PLANS.plus.price).toBe(19.9);
    expect(PLANS.premium.price).toBe(25.9);
    expect(formatPrice(PLANS.plus.price).replace(/\s/g, " ")).toBe("R$ 19,90");
    expect(formatPrice(PLANS.premium.price).replace(/\s/g, " ")).toBe("R$ 25,90");
    expect(formatPrice(0)).toBe("Grátis");
  });

  it("cada plano inclui os recursos dos anteriores", () => {
    expect(hasPlan("gratuito", "plus")).toBe(false);
    expect(hasPlan("plus", "plus")).toBe(true);
    expect(hasPlan("plus", "premium")).toBe(false);
    expect(hasPlan("premium", "plus")).toBe(true);
    expect(hasPlan("premium", "premium")).toBe(true);
  });
});

describe("links de vídeo", () => {
  it("reconhece YouTube em todos os formatos comuns", () => {
    const embed = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ";
    for (const url of [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtu.be/dQw4w9WgXcQ",
      "https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=10",
      "https://youtube.com/shorts/dQw4w9WgXcQ",
    ]) {
      expect(parseVideoUrl(url)).toEqual({ kind: "embed", provider: "YouTube", src: embed });
    }
  });

  it("reconhece Google Drive, Vimeo e arquivos de vídeo", () => {
    expect(parseVideoUrl("https://drive.google.com/file/d/1AbC-dEf_9/view?usp=sharing")).toMatchObject({
      kind: "embed",
      src: "https://drive.google.com/file/d/1AbC-dEf_9/preview",
    });
    expect(parseVideoUrl("https://vimeo.com/123456")).toMatchObject({ kind: "embed", src: "https://player.vimeo.com/video/123456" });
    expect(parseVideoUrl("https://exemplo.com/video.mp4")).toEqual({ kind: "file", src: "https://exemplo.com/video.mp4" });
    expect(parseVideoUrl("https://wa.me/algo")).toEqual({ kind: "link", src: "https://wa.me/algo" });
  });

  it("recusa links que não são http(s)", () => {
    expect(parseVideoUrl("javascript:alert(1)")).toBeNull();
    expect(parseVideoUrl("não é link")).toBeNull();
  });
});

describe("pedidos à equipe KP", () => {
  const base: KpRequest = { id: "r1", type: "video", createdAt: "2026-10-27T10:00:00.000Z", message: "Falhas perto da cabeceira" };

  it("mostra o andamento do pedido", () => {
    expect(kpRequestStatus(base).label).toBe("Não enviado");
    expect(kpRequestStatus({ ...base, sentAt: base.createdAt }).label).toBe("Aguardando vídeo");
    expect(kpRequestStatus({ ...base, sentAt: base.createdAt, videoUrl: "https://youtu.be/dQw4w9WgXcQ" }).label).toBe("Vídeo disponível");
    const visit: KpRequest = { ...base, type: "consultoria", sentAt: base.createdAt };
    expect(kpRequestStatus(visit).label).toBe("Aguardando contato");
    expect(kpRequestStatus({ ...visit, scheduledFor: "2026-11-03" }).label).toBe("Visita em 03/11/2026");
    expect(kpRequestStatus({ ...visit, scheduledFor: "2026-11-03", completedAt: "2026-11-03T15:00:00Z" }).label).toBe("Visita realizada");
  });

  it("monta a mensagem com produtor, talhão e problema", () => {
    const field = createDemoFields(new Date(2026, 9, 27)).find((f) => f.name === "Talhão 03");
    const text = kpMessage(
      { type: "consultoria", message: "Emergência parou", phone: "(65) 99999-0000", preferredPeriod: "Manhã" },
      field,
      DEMO_PROFILE,
    );
    expect(text).toContain("consultoria presencial");
    expect(text).toContain("Luiza — Fazenda Horizonte");
    expect(text).toContain("Talhão 03 — Soja (41 ha) · emergência 76% (meta 92%)");
    expect(text).toContain("Telefone: (65) 99999-0000");
  });

  it("descarta links e fotos inválidos ao importar", () => {
    const parsed = parseAppData({
      version: 1,
      profile: {},
      fields: [],
      kpRequests: [
        { ...base, videoUrl: "javascript:alert(1)", photo: "https://exemplo.com/a.jpg" },
        { id: "x", type: "outro", createdAt: "2026-10-27", message: "?" },
      ],
    });
    expect(parsed?.kpRequests).toHaveLength(1);
    expect(parsed?.kpRequests[0].videoUrl).toBeUndefined();
    expect(parsed?.kpRequests[0].photo).toBeUndefined();
  });
});
