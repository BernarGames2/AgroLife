/**
 * Contas locais do protótipo: ficam apenas neste navegador. A senha nunca é
 * guardada — só um hash PBKDF2 com sal, para conferir o acesso ao entrar.
 */

export interface LocalAccount {
  email: string;
  name: string;
  createdAt: string;
  salt?: string;
  hash?: string;
}

const ACCOUNTS_KEY = "agrolife:accounts:v1";
const ITERATIONS = 100_000;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function loadAccounts(): Record<string, LocalAccount> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? (parsed as Record<string, LocalAccount>) : {};
  } catch {
    return {};
  }
}

export function findAccount(email: string): LocalAccount | undefined {
  return loadAccounts()[normalizeEmail(email)];
}

export function saveAccount(account: LocalAccount): void {
  try {
    const accounts = loadAccounts();
    accounts[normalizeEmail(account.email)] = { ...account, email: normalizeEmail(account.email) };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // Armazenamento bloqueado: a conta vale só nesta sessão.
  }
}

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

async function derive(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: salt as BufferSource, iterations: ITERATIONS, hash: "SHA-256" }, key, 256);
  return toBase64(new Uint8Array(bits));
}

/** Gera sal e hash da senha. Sem Web Crypto (endereço sem https), não protege a conta com senha. */
export async function hashPassword(password: string): Promise<Pick<LocalAccount, "salt" | "hash">> {
  if (typeof crypto === "undefined" || !crypto.subtle) return {};
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { salt: toBase64(salt), hash: await derive(password, salt) };
}

export async function verifyPassword(password: string, account: LocalAccount): Promise<boolean> {
  if (!account.hash || !account.salt) return true;
  if (typeof crypto === "undefined" || !crypto.subtle) return false;
  return (await derive(password, fromBase64(account.salt))) === account.hash;
}
