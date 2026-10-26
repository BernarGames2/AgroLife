import type { Uniformity } from "@/types";

/**
 * Estimativa de cobertura verde por cor (índice Excess Green, ExG = 2g − r − b,
 * com r, g, b normalizados). É uma aproximação simples, sensível à luz,
 * sombras e palhada — serve como apoio visual, não como diagnóstico.
 */

const EXG_THRESHOLD = 0.12;
const MIN_BRIGHTNESS = 60;

export function isVegetation(r: number, g: number, b: number): boolean {
  const sum = r + g + b;
  if (sum < MIN_BRIGHTNESS) return false;
  if (g <= r || g <= b) return false;
  const exg = (2 * g - r - b) / sum;
  return exg > EXG_THRESHOLD;
}

export interface GridCell {
  row: number;
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Fração de pixels de vegetação na célula (0–1). */
  cover: number;
  low: boolean;
}

export interface CoverAnalysis {
  width: number;
  height: number;
  /** Cobertura verde (0–100). */
  coverage: number;
  rows: number;
  cols: number;
  cells: GridCell[];
  lowCells: number;
  /** Coeficiente de variação da cobertura entre as células. */
  cv: number;
  uniformity: Uniformity;
  /** 1 = vegetação, 0 = não vegetação, por pixel. */
  mask: Uint8Array;
  /** Pouca vegetação detectada: a foto pode não mostrar a lavoura ou estar mal iluminada. */
  lowSignal: boolean;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function gridFor(width: number, height: number, cols = 6): { rows: number; cols: number } {
  const rows = Math.min(8, Math.max(3, Math.round((cols * height) / width)));
  return { rows, cols };
}

export function analyzePixels(data: Uint8ClampedArray, width: number, height: number, cols = 6): CoverAnalysis {
  const mask = new Uint8Array(width * height);
  let vegetation = 0;
  for (let i = 0, p = 0; p < mask.length; i += 4, p++) {
    if (isVegetation(data[i], data[i + 1], data[i + 2])) {
      mask[p] = 1;
      vegetation++;
    }
  }

  const grid = gridFor(width, height, cols);
  const cells: GridCell[] = [];
  for (let row = 0; row < grid.rows; row++) {
    const y0 = Math.floor((row * height) / grid.rows);
    const y1 = Math.floor(((row + 1) * height) / grid.rows);
    for (let col = 0; col < grid.cols; col++) {
      const x0 = Math.floor((col * width) / grid.cols);
      const x1 = Math.floor(((col + 1) * width) / grid.cols);
      let count = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) count += mask[y * width + x];
      }
      const area = Math.max(1, (x1 - x0) * (y1 - y0));
      cells.push({ row, col, x: x0, y: y0, width: x1 - x0, height: y1 - y0, cover: count / area, low: false });
    }
  }

  const covers = cells.map((c) => c.cover);
  const med = median(covers);
  const mean = covers.reduce((a, b) => a + b, 0) / covers.length;
  const sd = Math.sqrt(covers.reduce((s, v) => s + (v - mean) ** 2, 0) / covers.length);
  const cv = mean > 0 ? sd / mean : 0;

  // Células com menos da metade da cobertura típica da foto são pontos de atenção.
  if (med >= 0.08) {
    for (const cell of cells) cell.low = cell.cover < med * 0.5;
  }
  const lowCells = cells.filter((c) => c.low).length;
  const lowShare = lowCells / cells.length;
  const coverage = (vegetation / mask.length) * 100;
  // Qualquer área destacada impede a classificação "alta", mesmo com variação média baixa.
  const uniformity: Uniformity = cv < 0.25 && lowCells === 0 ? "alta" : cv < 0.5 && lowShare < 0.25 ? "media" : "baixa";

  return {
    width,
    height,
    coverage,
    rows: grid.rows,
    cols: grid.cols,
    cells,
    lowCells,
    cv,
    uniformity,
    mask,
    lowSignal: coverage < 5,
  };
}

export const UNIFORMITY_LABEL: Record<Uniformity, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

/* ---------- Funções de navegador ---------- */

export async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    // A imagem já foi decodificada; a URL temporária pode ser liberada.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

export function drawScaled(img: HTMLImageElement, maxSide: number): HTMLCanvasElement {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas indisponível");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export async function analyzeImageFile(file: File): Promise<{ analysis: CoverAnalysis; source: HTMLCanvasElement; thumbnail: string }> {
  const img = await loadImage(file);
  const source = drawScaled(img, 720);
  const ctx = source.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas indisponível");
  const { data } = ctx.getImageData(0, 0, source.width, source.height);
  const analysis = analyzePixels(data, source.width, source.height);
  const thumbCanvas = drawScaled(img, 240);
  const thumbnail = thumbCanvas.toDataURL("image/jpeg", 0.7);
  return { analysis, source, thumbnail };
}

/** Desenha a foto com a máscara de vegetação e as áreas de baixa cobertura destacadas. */
export function renderOverlay(
  target: HTMLCanvasElement,
  source: HTMLCanvasElement,
  analysis: CoverAnalysis,
  options: { showMask: boolean; showGrid: boolean },
): void {
  target.width = source.width;
  target.height = source.height;
  const ctx = target.getContext("2d");
  if (!ctx) return;
  ctx.drawImage(source, 0, 0);

  if (options.showMask) {
    const image = ctx.getImageData(0, 0, target.width, target.height);
    const px = image.data;
    for (let p = 0, i = 0; p < analysis.mask.length; p++, i += 4) {
      if (analysis.mask[p]) {
        px[i] = px[i] * 0.45 + 40 * 0.55;
        px[i + 1] = px[i + 1] * 0.45 + 220 * 0.55;
        px[i + 2] = px[i + 2] * 0.45 + 90 * 0.55;
      } else {
        px[i] *= 0.55;
        px[i + 1] *= 0.55;
        px[i + 2] *= 0.55;
      }
    }
    ctx.putImageData(image, 0, 0);
  }

  if (options.showGrid) {
    const line = Math.max(1, Math.round(target.width / 360));
    ctx.lineWidth = line;
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    for (const cell of analysis.cells) ctx.strokeRect(cell.x + 0.5, cell.y + 0.5, cell.width - 1, cell.height - 1);
    for (const cell of analysis.cells.filter((c) => c.low)) {
      ctx.fillStyle = "rgba(220, 38, 38, 0.28)";
      ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
      ctx.strokeStyle = "rgba(254, 226, 226, 0.95)";
      ctx.lineWidth = line * 2;
      ctx.strokeRect(cell.x + line, cell.y + line, cell.width - line * 2, cell.height - line * 2);
    }
  }
}
