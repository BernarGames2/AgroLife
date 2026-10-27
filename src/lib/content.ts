/** Conteúdos fixos: checklist de plantio e artigos do AgroLife Academy. */

export interface ChecklistItem {
  id: string;
  label: string;
  hint: string;
}

export const PLANTING_CHECKLIST: ChecklistItem[] = [
  { id: "umidade", label: "Condição de umidade do solo", hint: "Solo nem seco nem encharcado na profundidade de semeadura." },
  { id: "profundidade", label: "Profundidade de deposição", hint: "Sementes na profundidade recomendada para a cultura, com cobertura uniforme." },
  { id: "regulagem", label: "Regulagem da plantadeira", hint: "Discos, dosadores e pressão das rodas conferidos antes de entrar no talhão." },
  { id: "distribuicao", label: "Distribuição das sementes", hint: "Sementes bem espaçadas na linha, sem falhas nem duplas." },
  { id: "velocidade", label: "Velocidade de operação", hint: "Velocidade compatível com a plantadeira para não aumentar falhas e duplas." },
  { id: "espacamento", label: "Espaçamento entre linhas", hint: "Espaçamento conferido e igual ao planejado." },
  { id: "clima", label: "Condições climáticas", hint: "Previsão sem chuva forte ou calor extremo logo após o plantio." },
  { id: "sementes", label: "Qualidade das sementes", hint: "Lote com germinação e vigor conhecidos (laudo ou teste)." },
];

export type AcademyCategory = "antes" | "durante" | "apos" | "monitoramento";

export const ACADEMY_CATEGORIES: Record<AcademyCategory, string> = {
  antes: "Antes do plantio",
  durante: "Durante o plantio",
  apos: "Após o plantio",
  monitoramento: "Monitoramento",
};

export interface AcademyArticle {
  id: string;
  category: AcademyCategory;
  title: string;
  summary: string;
  tips: string[];
}

export const ACADEMY_ARTICLES: AcademyArticle[] = [
  {
    id: "umidade-solo",
    category: "antes",
    title: "Umidade do solo",
    summary: "Solo muito seco ou encharcado altera a germinação e pode gerar estande desuniforme.",
    tips: [
      "Pegue um punhado de solo da profundidade de semeadura: ele deve formar um torrão que se desfaz com leve pressão.",
      "Em solo seco, a semente pode germinar só parcialmente e morrer; em solo encharcado, falta oxigênio e aumenta o risco de doenças.",
      "Evite plantar logo antes de chuvas fortes, que podem formar crosta na superfície.",
    ],
  },
  {
    id: "qualidade-sementes",
    category: "antes",
    title: "Qualidade das sementes",
    summary: "Vigor e germinação do lote influenciam diretamente o estande final.",
    tips: [
      "Peça o laudo de germinação e vigor do lote e guarde junto com os dados do talhão.",
      "Armazene as sementes em local fresco, seco e ventilado até o plantio.",
      "Ajuste a quantidade de sementes por metro considerando a germinação informada no laudo.",
    ],
  },
  {
    id: "profundidade",
    category: "durante",
    title: "Profundidade de sementes",
    summary: "Profundidade fora da faixa recomendada atrasa ou reduz a emergência.",
    tips: [
      "Confira a profundidade abrindo o sulco em alguns pontos logo no início do plantio.",
      "Sementes muito rasas ficam expostas ao ressecamento; muito fundas gastam reserva antes de emergir.",
      "Siga a faixa recomendada para a cultura e o tipo de solo.",
    ],
  },
  {
    id: "regulagem",
    category: "durante",
    title: "Regulagem de plantadeira",
    summary: "Discos, dosadores e pressão do sulcador afetam deposição e espaçamento.",
    tips: [
      "Use o disco e o anel corretos para o tamanho da semente do lote.",
      "Verifique desgaste de discos de corte e rodas compactadoras antes da safra.",
      "Faça um teste em poucos metros e conte as sementes na linha antes de seguir.",
    ],
  },
  {
    id: "velocidade",
    category: "durante",
    title: "Velocidade de operação",
    summary: "Velocidade elevada tende a aumentar falhas e duplas na linha.",
    tips: [
      "Respeite a velocidade indicada pelo fabricante da plantadeira.",
      "Se aumentar a velocidade, confira novamente a distribuição das sementes.",
      "Terrenos irregulares pedem velocidade menor para manter a profundidade.",
    ],
  },
  {
    id: "estabelecimento",
    category: "apos",
    title: "Estabelecimento da lavoura",
    summary: "É a fase que define o estande; dela depende boa parte do potencial produtivo.",
    tips: [
      "Os primeiros dias após o plantio são os mais sensíveis a falta de água, crosta e pragas de solo.",
      "Acompanhar a emergência cedo permite corrigir problemas enquanto ainda há tempo.",
      "Registre as condições observadas: elas ajudam a explicar o resultado da safra.",
    ],
  },
  {
    id: "replantio",
    category: "apos",
    title: "Quando avaliar replantio",
    summary: "A decisão depende do estande, da uniformidade, da época e do custo — e deve ser tomada com apoio técnico.",
    tips: [
      "Falhas pequenas e bem distribuídas muitas vezes são compensadas pelas plantas vizinhas.",
      "Falhas grandes e concentradas (reboleiras) tendem a pesar mais na produtividade.",
      "Considere a data limite de plantio da região antes de decidir.",
    ],
  },
  {
    id: "estande",
    category: "monitoramento",
    title: "Estande de plantas",
    summary: "Número de plantas por área — base para entender o potencial do talhão.",
    tips: [
      "O AgroLife estima o estande a partir das sementes por metro, do espaçamento e da emergência.",
      "Compare o estande obtido com o planejado para a cultivar ou híbrido.",
      "Uniformidade importa tanto quanto o número: plantas muito juntas ou isoladas produzem diferente.",
    ],
  },
  {
    id: "emergencia",
    category: "monitoramento",
    title: "Emergência",
    summary: "Percentual de sementes que viraram plantas visíveis acima do solo.",
    tips: [
      "Acompanhe em mais de uma data: a emergência evolui nos primeiros dias e depois se estabiliza.",
      "Uma emergência que para de subir abaixo da meta merece investigação.",
      "Compare talhões com a mesma cultura para identificar padrões.",
    ],
  },
  {
    id: "contagem",
    category: "monitoramento",
    title: "Como contar plantas na linha",
    summary: "Uma contagem simples, feita em vários pontos, já mostra muito sobre o talhão.",
    tips: [
      "Escolha ao menos 5 pontos espalhados pelo talhão, evitando cabeceiras e bordas.",
      "Em cada ponto, meça um trecho da linha (ex.: 5 metros) e conte as plantas emergidas.",
      "Registre cada ponto separadamente no AgroLife para ver a variação entre eles.",
    ],
  },
];
