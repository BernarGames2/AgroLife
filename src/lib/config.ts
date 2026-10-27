/**
 * Configurações da equipe KP.
 * Preencha o WhatsApp com DDI + DDD + número, só dígitos (ex.: "5565999999999").
 * Vazio: o WhatsApp abre para o produtor escolher o contato.
 */
export const KP_WHATSAPP = "";

export function whatsappLink(text: string): string {
  const base = KP_WHATSAPP ? `https://wa.me/${KP_WHATSAPP}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(text)}`;
}
