# AgroLife

> Do início bem feito, ao lucro perfeito.

Plataforma de monitoramento e apoio à decisão para acompanhar o **estabelecimento da lavoura**: registre contagens de emergência por talhão, compare com a meta e receba pontos de atenção com ações sugeridas.

Protótipo em fase de validação: não há servidor. As contas e os dados ficam no navegador (`localStorage`), separados por conta, e podem ser exportados e importados em JSON pela tela de perfil. A senha não é guardada: só um hash PBKDF2 com sal, usado para conferir o acesso.

## Funcionalidades

| Tela | O que faz |
| --- | --- |
| **Início** (`/`) | Apresentação, como funciona e chamada para cadastro. |
| **Planos** (`/planos`) | Planos da fase de validação e perguntas frequentes. |
| **Entrar** (`/entrar`) | Entrar, criar conta (sempre começa vazia) ou explorar a demonstração, que tem dados separados. |
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
| **Equipe KP** (`/app/kp`) | Pedido de vídeo personalizado (Plus) ou consultoria presencial (Premium), enviado pelo WhatsApp; o vídeo recebido aparece no pedido e no talhão. |
| **Análises Premium** (`/app/premium`) | Plano de correção do solo, falhas e replantio, tendência, prioridade de vistoria, cronograma e relatório (Premium). |
| **Planos** (`/app/planos`) | Plano atual e assinatura em modo de demonstração. |
| **Perfil** (`/app/perfil`) | Dados do produtor, plano atual, exportar/importar dados, restaurar demonstração e sair. |
| **Mais** (`/app/mais`) | No celular, reúne todas as seções que não cabem na barra inferior. |

No computador, todas as seções ficam no menu lateral. No celular, a barra inferior mostra Dashboard, Talhões, Analisar, Alertas e **Mais**, que dá acesso ao restante.

### Planos

| Plano | Preço | Recursos |
| --- | --- | --- |
| **Gratuito** | Grátis | Tudo o que está descrito acima. |
| **Plus** | R$ 19,90/mês | Tudo do Gratuito + vídeos personalizados da equipe KP: o produtor conta o que está acontecendo e recebe um vídeo. |
| **Premium** | R$ 25,90/mês | Tudo do Plus + consultoria presencial da equipe KP e Análises Premium. |

Planos, preços e recursos ficam em `src/lib/plans.ts`. No protótipo não há pagamento: a assinatura é ativada apenas em modo de demonstração.

Os pedidos à equipe KP são enviados pelo WhatsApp. Para que eles cheguem direto ao número da KP, preencha `KP_WHATSAPP` em `src/lib/config.ts`. Quando a KP enviar o vídeo, o produtor cola o link (YouTube, Google Drive, Vimeo ou arquivo de vídeo) no pedido e o vídeo passa a aparecer no app. Para a KP publicar os vídeos direto no app, será preciso um servidor.

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

O app é uma SPA com rotas no navegador (`BrowserRouter`). Na Vercel, o `vercel.json` já direciona todas as rotas para `index.html`. Em outra hospedagem estática, configure o mesmo *fallback*; sem ele, abrir `/app` diretamente retorna 404.

## Estrutura

```
src/
  components/      componentes de interface (layouts, cartões, gráfico, ui/)
  lib/
    agro.ts        status, alertas e cálculos agronômicos
    plans.ts       planos, preços e recursos
    premium.ts     Análises Premium
    kp.ts          pedidos à equipe KP
    video.ts       leitura de links de vídeo
    content.ts     checklist de plantio e artigos do Academy
    treemap.ts     layout do mapa ilustrativo
    demo.ts        dados de demonstração (Fazenda Horizonte)
    imageAnalysis.ts  análise de cobertura verde por foto
    storage.ts     persistência e validação de dados importados
  pages/           páginas públicas e do app (pages/app)
  store/           estado global (AppStore)
  test/            testes unitários
```
