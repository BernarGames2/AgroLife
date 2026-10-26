import { describe, expect, it } from "vitest";
import { analyzePixels, isVegetation } from "@/lib/imageAnalysis";

function image(width: number, height: number, paint: (x: number, y: number) => [number, number, number]) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = paint(x, y);
      const i = (y * width + x) * 4;
      data.set([r, g, b, 255], i);
    }
  }
  return data;
}

const GREEN: [number, number, number] = [60, 130, 45];
const SOIL: [number, number, number] = [140, 110, 80];

describe("isVegetation", () => {
  it("separa planta de solo, palhada e sombra", () => {
    expect(isVegetation(...GREEN)).toBe(true);
    expect(isVegetation(120, 160, 60)).toBe(true);
    expect(isVegetation(...SOIL)).toBe(false);
    expect(isVegetation(200, 180, 120)).toBe(false);
    expect(isVegetation(18, 24, 16)).toBe(false);
  });
});

describe("analyzePixels", () => {
  it("mede a cobertura verde", () => {
    const w = 60;
    const h = 40;
    const data = image(w, h, (x) => (x < 30 ? GREEN : SOIL));
    const result = analyzePixels(data, w, h);
    expect(result.coverage).toBeCloseTo(50, 0);
  });

  it("considera uniforme uma lavoura sem falhas", () => {
    const result = analyzePixels(image(60, 40, () => GREEN), 60, 40);
    expect(result.coverage).toBe(100);
    expect(result.uniformity).toBe("alta");
  });

  it("destaca áreas com cobertura bem abaixo do restante", () => {
    const w = 60;
    const h = 40;
    // Lavoura cheia com uma falha no canto superior esquerdo
    const data = image(w, h, (x, y) => (x < 10 && y < 10 ? SOIL : GREEN));
    const result = analyzePixels(data, w, h);
    expect(result.lowCells).toBeGreaterThan(0);
    const low = result.cells.filter((c) => c.low);
    expect(low.every((c) => c.x < 10 && c.y < 10)).toBe(true);
    expect(result.uniformity).not.toBe("alta");
  });

  it("indica pouca vegetação quando a foto não mostra plantas", () => {
    const result = analyzePixels(image(30, 30, () => SOIL), 30, 30);
    expect(result.lowSignal).toBe(true);
    expect(result.lowCells).toBe(0);
  });
});
