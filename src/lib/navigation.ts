import {
  ArrowLeftRight,
  Bell,
  BookOpen,
  Camera,
  Crown,
  FileText,
  LayoutDashboard,
  ListChecks,
  Map,
  Sparkles,
  Sprout,
  UserRound,
  Video,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  description: string;
  end?: boolean;
}

/** Todas as seções do app, na ordem do menu lateral. */
export const NAV_ITEMS: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true, description: "Resumo dos talhões" },
  { to: "/app/talhoes", label: "Talhões", icon: Sprout, description: "Cadastro e avaliações" },
  { to: "/app/analisar", label: "Analisar área", icon: Camera, description: "Análise por foto" },
  { to: "/app/alertas", label: "Alertas", icon: Bell, description: "Pontos de atenção" },
  { to: "/app/mapa", label: "Mapa", icon: Map, description: "Visão da propriedade" },
  { to: "/app/checklist", label: "Checklist", icon: ListChecks, description: "Conferência do plantio" },
  { to: "/app/comparar", label: "Comparar", icon: ArrowLeftRight, description: "Talhões lado a lado" },
  { to: "/app/relatorios", label: "Relatórios", icon: FileText, description: "Imprimir e compartilhar" },
  { to: "/app/academy", label: "Academy", icon: BookOpen, description: "Conteúdos rápidos" },
  { to: "/app/kp", label: "Equipe KP", icon: Video, description: "Vídeos e consultoria" },
  { to: "/app/premium", label: "Análises Premium", icon: Sparkles, description: "Correção, falhas e tendência" },
  { to: "/app/perfil", label: "Meu perfil", icon: UserRound, description: "Conta e dados" },
  { to: "/app/planos", label: "Planos", icon: Crown, description: "Gratuito, Plus e Premium" },
];

/** Itens fixos da barra inferior do celular; os demais ficam em "Mais". */
export const BOTTOM_NAV_PATHS = ["/app", "/app/talhoes", "/app/analisar", "/app/alertas"];

export const MORE_ITEMS = NAV_ITEMS.filter((i) => !BOTTOM_NAV_PATHS.includes(i.to));
