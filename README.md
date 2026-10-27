# AgroLife

> Do início bem feito, ao lucro perfeito.

Plataforma de monitoramento e apoio à decisão para acompanhar o **estabelecimento da lavoura**: registre contagens de emergência por talhão, compare com a meta e receba pontos de atenção com ações sugeridas.

Protótipo em fase de validação: não há servidor. Os dados ficam no navegador (`localStorage`) e podem ser exportados e importados em JSON pela tela de perfil.

## Funcionalidades

| Tela | O que faz |
| --- | --- |
| **Início** (`/`) | Apresentação, como funciona e chamada para cadastro. |
| **Planos** (`/planos`) | Planos da fase de validação e perguntas frequentes. |
| **Entrar** (`/entrar`) | Entrar, criar conta (com ou sem dados de demonstração) ou explorar a demonstração. |
| **Dashboard** (`/app`) | Resumo da propriedade, gráfico de evolução por talhão, talhões e pontos de atenção. |
| **Talhões** (`/app/talhoes`) | Busca, filtro por status e ordenação por nome ou prioridade. |
| **Detalhe do talhão** | Emergência atual, estande estimado (plantas/ha), alertas, gráfico com a meta, histórico de avaliações e análises de foto. |
| **Novo / editar talhão** | Cultura, área, meta, data de plantio, cultivar e regulagem da plantadeira (com valores sugeridos por cultura). |
| **Registrar avaliação** | Contagem de plantas em vários pontos da linha (calcula emergência e variação entre pontos) ou percentual direto. |
| **Analisar** (`/app/analisar`) | Foto da lavoura → cobertura verde estimada, uniformidade e áreas com baixa cobertura destacadas. |
| **Alertas** (`/app/alertas`) | Todos os pontos de atenção, filtráveis por gravidade. |
| **Mapa** (`/app/mapa`) | Mapa ilustrativo da propriedade: blocos proporcionais à área, coloridos pelo status. |
| **Checklist** (`/app/checklist`) | Checklist de plantio com 8 itens e progresso salvo. |
| **Comparar** (`/app/comparar`) | Evolução da emergência por dias após o plantio e tabela de indicadores lado a lado. |
| **Relatórios** (`/app/relatorios`) | Relatório por talhão para imprimir/salvar em PDF ou compartilhar o resumo (WhatsApp, e-mail). |
| **Academy** (`/app/academy`) | Conteúdos curtos por etapa: antes, durante e após o plantio e monitoramento. |
| **Premium e Plus** (`/app/premium`) | Ativação em modo de demonstração dos recursos avançados e do acompanhamento presencial. |
| **Perfil** (`/app/perfil`) | Dados do produtor, plano atual, exportar/importar dados, restaurar demonstração e sair. |
| **Mais** (`/app/mais`) | No celular, reúne todas as seções que não cabem na barra inferior. |

No computador, todas as seções ficam no menu lateral. No celular, a barra inferior mostra Dashboard, Talhões, Analisar, Alertas e **Mais**, que dá acesso ao restante.

### Planos

| Plano | Recursos |
| --- | --- |
| **Gratuito** | Tudo o que está descrito acima. |
| **Premium** | Plano de correção do solo, estimativa de falhas e replantio, tendência da emergência (2 dias), prioridade de vistoria, cronograma de ações e relatório Premium. |
| **Premium Plus** | Tudo do Premium + acompanhamento presencial da equipe KP (visitas, avaliação de estande e solo, apoio na regulagem, relatório da visita). |

Os preços do Premium e do Premium Plus ainda não foram definidos. No protótipo, a ativação é apenas demonstrativa (`src/lib/premium.ts`).

### Regras de classificação

A classificação compara a última avaliação com a meta do talhão (`src/lib/agro.ts`):

| Diferença para a meta | Status |
| --- | --- |
| até 3 p.p. abaixo (ou acima) | 🟢 Dentro do esperado |
| de 4 a 10 p.p. abaixo | 🟡 Atenção |
| mais de 10 p.p. abaixo | 🔴 Investigar |

Alertas complementares:

- **Estande desuniforme**: coeficiente de variação acima de 20% entre os pontos de contagem.
- **Emergência estabilizada abaixo da meta**: menos de 1 p.p. de avanço entre as duas últimas avaliações.
- **Avaliação desatualizada**: mais de 7 dias sem avaliação durante os primeiros 35 dias após o plantio.

**Cálculos:**

- Emergência (%) = plantas contadas ÷ metros avaliados ÷ sementes por metro × 100.
- Estande (plantas/ha) = sementes por metro × (10.000 ÷ espaçamento em m) × emergência.

### Análise por foto

A análise roda no próprio navegador, sem enviar a foto para nenhum servidor. Ela usa o índice *Excess Green* (ExG = 2g − r − b) para separar vegetação de solo. Depois divide a imagem em uma grade e destaca as células com menos da metade da cobertura típica da foto. É uma estimativa sensível a sombras, palhada e iluminação: serve de apoio e não é um diagnóstico.

> Os alertas e análises são indicativos e não substituem a avaliação de um profissional qualificado.

## Tecnologias

React 18, TypeScript, Vite, Tailwind CSS, React Router, Recharts, Lucide e Vitest.

## Como rodar

Requer Node.js 20.19 ou superior.

```sh
npm ci
npm run dev        # http://localhost:8080
```

Outros comandos:

```sh
npm test           # testes (Vitest)
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run build      # build de produção em dist/
npm run preview    # serve o build localmente
```

### Publicação

O app é uma SPA com rotas no navegador (`BrowserRouter`). Ao publicar em hospedagem estática, configure o *fallback* de todas as rotas para `index.html`. Sem isso, abrir `/app` diretamente retorna 404.

## Estrutura

```
src/
  components/      componentes de interface (layouts, cartões, gráfico, ui/)
  lib/
    agro.ts        status, alertas e cálculos agronômicos
    premium.ts     recursos do plano Premium
    content.ts     checklist de plantio e artigos do Academy
    treemap.ts     layout do mapa ilustrativo
    demo.ts        dados de demonstração (Fazenda Horizonte)
    imageAnalysis.ts  análise de cobertura verde por foto
    storage.ts     persistência e validação de dados importados
  pages/           páginas públicas e do app (pages/app)
  store/           estado global (AppStore)
  test/            testes unitários
```
