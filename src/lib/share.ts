/** Compartilha um texto pelo menu do sistema; sem suporte, copia para a área de transferência. */
export async function shareText(title: string, text: string): Promise<"shared" | "copied" | "failed"> {
  try {
    if (typeof navigator.share === "function") {
      await navigator.share({ title, text });
      return "shared";
    }
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch (err) {
    // Cancelar o menu de compartilhamento não é erro.
    if (err instanceof DOMException && err.name === "AbortError") return "shared";
    return "failed";
  }
}
