import { describe, expect, it } from "vitest";
import { parseAppData } from "@/lib/storage";
import { createDemoData } from "@/lib/demo";
import { safeInternalPath } from "@/lib/utils";

describe("parseAppData", () => {
  it("aceita dados exportados pelo próprio app", () => {
    const data = createDemoData(new Date(2026, 9, 26));
    expect(parseAppData(JSON.parse(JSON.stringify(data)))).toEqual(JSON.parse(JSON.stringify(data)));
  });

  it("rejeita arquivos de outro formato", () => {
    expect(parseAppData(null)).toBeNull();
    expect(parseAppData({ version: 2, profile: {}, fields: [] })).toBeNull();
    expect(parseAppData([1, 2, 3])).toBeNull();
  });

  it("descarta talhões e miniaturas inválidos", () => {
    const parsed = parseAppData({
      version: 1,
      profile: { name: "Ana" },
      fields: [{ id: "x" }],
      analyses: [{ id: "a", date: "2026-10-01", coverage: 50, thumbnail: "javascript:alert(1)" }],
    });
    expect(parsed?.fields).toEqual([]);
    expect(parsed?.analyses[0].thumbnail).toBeUndefined();
  });
});

describe("safeInternalPath", () => {
  it("só permite caminhos internos", () => {
    expect(safeInternalPath("/app/talhoes")).toBe("/app/talhoes");
    expect(safeInternalPath("https://exemplo.com")).toBe("/app");
    expect(safeInternalPath("//exemplo.com")).toBe("/app");
    expect(safeInternalPath("/\\exemplo.com")).toBe("/app");
    expect(safeInternalPath(null)).toBe("/app");
  });
});
