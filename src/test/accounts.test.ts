import { beforeEach, describe, expect, it } from "vitest";
import { findAccount, hashPassword, saveAccount, verifyPassword } from "@/lib/accounts";
import { createDemoData, createEmptyData, DEMO_EMAIL } from "@/lib/demo";
import { loadData, migrateLegacyData, saveData, saveSession } from "@/lib/storage";

// localStorage em memória para os testes (o ambiente de teste é Node).
class MemoryStorage {
  private map = new Map<string, string>();
  getItem(k: string) {
    return this.map.has(k) ? (this.map.get(k) as string) : null;
  }
  setItem(k: string, v: string) {
    this.map.set(k, String(v));
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
  clear() {
    this.map.clear();
  }
}

beforeEach(() => {
  (globalThis as unknown as { localStorage: MemoryStorage }).localStorage = new MemoryStorage();
});

const NOW = new Date(2026, 9, 27);

describe("senha", () => {
  it("confere a senha certa e recusa a errada, sem guardar a senha", async () => {
    const cred = await hashPassword("segredo123");
    expect(cred.hash).toBeTruthy();
    expect(JSON.stringify(cred)).not.toContain("segredo123");
    const account = { email: "a@b.com", name: "Ana", createdAt: "", ...cred };
    expect(await verifyPassword("segredo123", account)).toBe(true);
    expect(await verifyPassword("outra-senha", account)).toBe(false);
  });
});

describe("dados por conta", () => {
  it("mantém contas e demonstração separadas", () => {
    saveData("bernardo@exemplo.com", createEmptyData({ name: "Bernardo", property: "Sítio", crops: "", location: "" }));
    saveData(DEMO_EMAIL, createDemoData(NOW));
    expect(loadData("bernardo@exemplo.com")?.fields).toHaveLength(0);
    expect(loadData(DEMO_EMAIL)?.fields).toHaveLength(3);
    expect(loadData("Bernardo@Exemplo.com ")?.profile.name).toBe("Bernardo");
  });
});

describe("migração da versão anterior", () => {
  it("não leva dados de demonstração para a conta: começa vazia e mantém o nome", () => {
    localStorage.setItem("agrolife:data:v1", JSON.stringify(createDemoData(NOW, { name: "Bernardo", property: "Sítio Boa Vista", crops: "Soja, Milho", location: "x" })));
    saveSession({ email: "bernardo@exemplo.com", signedInAt: NOW.toISOString() });
    migrateLegacyData();
    const data = loadData("bernardo@exemplo.com");
    expect(data?.fields).toEqual([]);
    expect(data?.isDemo).toBe(false);
    expect(data?.profile).toMatchObject({ name: "Bernardo", property: "Sítio Boa Vista" });
    expect(findAccount("bernardo@exemplo.com")?.name).toBe("Bernardo");
    expect(localStorage.getItem("agrolife:data:v1")).toBeNull();
  });

  it("preserva dados reais de quem já usava o app", () => {
    const own = { ...createEmptyData({ name: "Ana", property: "Fazenda A", crops: "", location: "" }), fields: createDemoData(NOW).fields.slice(0, 1) };
    localStorage.setItem("agrolife:data:v1", JSON.stringify(own));
    saveSession({ email: "ana@exemplo.com", signedInAt: NOW.toISOString() });
    saveAccount({ email: "ana@exemplo.com", name: "Ana", createdAt: "" });
    migrateLegacyData();
    expect(loadData("ana@exemplo.com")?.fields).toHaveLength(1);
  });
});
