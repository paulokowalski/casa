# Casa

Front da casa: gestão do cartão de crédito, orçamento mensal (contas fixas + cartão + renda),
geração de energia solar e cadastro de pessoas. Consome a [`casa-api`](../casa-api).

- **Stack:** React 19 · TypeScript 6 · Vite 8 · MUI 9 · React Router 7 · Recharts 3 · axios · jsPDF
- **Node:** 26 (o mesmo da imagem Docker)
- **Porta:** 3000

## Sumário

- [Telas](#telas)
- [Rodando](#rodando)
- [Configuração](#configuração)
- [Scripts](#scripts)
- [Deploy (Docker + nginx)](#deploy-docker--nginx)
- [Arquitetura](#arquitetura)
- [Integração com a API](#integração-com-a-api)
- [Convenções](#convenções)

## Telas

| Rota                 | Tela                         | O que mostra                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/login`             | Login                        | E-mail e senha; a sessão fica salva no navegador até o token expirar                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `/`                  | Dashboard                    | Resumo do dia: câmbio (dólar/euro), valor do carro (FIPE atual e histórico), potência e geração solar                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `/gestao-cartao`     | Gestão de Cartão             | Gastos do mês por pessoa/cartão, saúde financeira, insights, gráficos (categoria, cartão, dia da semana, maiores gastos), próximos 12 meses, cadastro/edição/cancelamento de parcelas, exportação em PDF                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `/gestao-financeira` | Gestão Financeira            | Contas fixas, financiamentos e cartão juntos: regra 50/30/20 sobre a renda, evolução de 12 meses, previsão de custo e sobra, onde economizar                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `/energia`           | Energia Solar                | Geração dos painéis por dia, mês e ano                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `/crescimento`       | Crescimento                  | Crianças da família: início (aviso de mêsversário, medidas, agenda, fotos), álbum (mêsversários, primeiras vezes, momentos especiais, cartão para compartilhar), diário, curvas da OMS, marcos, vacinas e exames (PDF ou imagem, vistos só pela família). Sem IA, por regra da família. Módulo em `src/modulos/crescimento`                                                                                                                                                                                                                                                                                                                |
| `/pessoa`            | Pessoas (só admin)           | Quem tem compras no sistema e quem pode entrar (senha, papel, ativo)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `/servidor`          | Saúde do Servidor (só admin) | Abas Visão geral, Internet, Discos, Ventilação, Containers, Sistema e Histórico. CPU, memória, temperaturas, discos, rede e containers ao vivo (a cada 15 s); histórico de um dia a cada 5 min e estatísticas dos últimos 30 dias (`/v1/servidor/*`, uma amostra por minuto no MariaDB). **Internet:** ping, perda, DNS, IP público e testes de velocidade, dos timers `casa-monitor-internet` e `casa-monitor-velocidade` do host. **Ventilação:** tomada das ventoinhas e temperaturas, gravadas a cada minuto pelo Home Assistant em `POST /v1/servidor/ventilacao` (com `X-API-KEY`). O botão Atualizar agora relê também a aba aberta |
| `/passagens`         | Passagens (só admin)         | Rotas do robô de passagens: cadastro (datas fixas ou período flexível, passageiros, escalas, preço-alvo em reais inteiros), pausar/retomar e remover; gráfico e tabela de preços por trecho e alertas enviados. API `/v1/passagens` do casa-api                                                                                                                                                                                                                                                                                                                                                                                            |

Todas as rotas, menos `/login`, exigem sessão. As telas carregam sob demanda (`React.lazy`).

**App no celular (PWA):** `public/manifest.webmanifest`, ícones em `public/` e `public/sw.js`. O service worker só
guarda a casca do app (HTML e `/assets`); nada de `/casa-api` passa por ele. No celular: abrir o site e "Adicionar à
tela de início". Ao mudar a lógica do `sw.js`, suba `CACHE`.

## Rodando

### Desenvolvimento

```bash
npm ci
npm run dev        # http://localhost:3000
```

Crie um `.env.local` apontando para a API:

```properties
VITE_API_BASE_URL=http://localhost:8080/casa-api/
```

### Sem Node instalado na máquina

O servidor não tem Node; rode os comandos dentro da imagem oficial, usando o projeto montado:

```bash
docker run --rm -v "$PWD":/app -w /app node:26 npm run check
```

Use a imagem `node:26` (Debian), não a `-alpine`, para que os binários nativos do `node_modules`
sirvam também fora do container.

## Configuração

| Variável            | Uso                                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Base das chamadas à API. Em produção é `/casa-api/` (relativo, passa pelo nginx); em desenvolvimento, a URL completa da API |

É lida **no build** (`import.meta.env`). Para mudar em produção, é preciso refazer a imagem.

## Scripts

| Comando                           | O que faz                                                                                                             |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Servidor de desenvolvimento (Vite) na porta 3000                                                                      |
| `npm run build`                   | Build de produção em `dist/`                                                                                          |
| `npm run preview`                 | Serve o build localmente                                                                                              |
| `npm run typecheck`               | `tsc --noEmit`                                                                                                        |
| `npm run lint` / `lint:fix`       | ESLint                                                                                                                |
| `npm run format` / `format:check` | Prettier                                                                                                              |
| `npm run check`                   | typecheck + lint + format:check + sem-ia (rode antes de commitar)                                                     |
| `npm run sem-ia`                  | Falha se o código, as páginas, o nginx ou as dependências citarem um serviço de IA (dados pessoais nunca vão para IA) |
| `npm run e2e`                     | Testes de ponta a ponta (Playwright), ver abaixo                                                                      |

### Testes E2E

`npm run e2e` (ou `bash e2e/rodar.sh [arquivos de teste]`) sobe numa rede Docker isolada um PostgreSQL com a
estrutura do banco, um MariaDB vazio, a casa-api e o site gerado do código atual, e roda os testes de `e2e/testes`
no navegador (celular e computador). Apaga tudo no fim e não toca nos bancos de produção. Precisa de:

- Docker e a imagem local `casa-api` (`docker compose build` no casa-api);
- `CASA_API_DIR`: pasta do casa-api, de onde vêm `src/test/resources/e2e/{estrutura,dados}.sql` (padrão
  `/opt/projetos/casa-api`).

Opcionais: `E2E_NODE_MODULES` (pasta do `node_modules`, padrão o do projeto) e `E2E_MANTER=1` (não apaga os
containers no fim, para investigar). O hook pre-commit roda esses testes antes de cada commit.

## Deploy (Docker + nginx)

```bash
docker compose up -d --build casa
```

- O `Dockerfile` faz o build com `node:26-alpine` (passando `VITE_API_BASE_URL=/casa-api/`) e serve o
  `dist/` com `nginx:1.30-alpine` na porta 3000.
- `nginx.conf`:
  - Faz fallback de SPA para `index.html`, sem cache no HTML e com cache de 1 ano nos assets com hash.
  - Aplica cabeçalhos de segurança (CSP, X-Frame-Options etc.) e gzip.
  - Faz **proxy de `/casa-api/` para `http://casa-api:8080`** pela rede Docker `casa-network`. Assim
    o navegador fala só com a porta 3000, sem CORS, e o Swagger da API também fica em
    `/casa-api/swagger-ui.html`.
- Quando uma mudança mexe na API e no front ao mesmo tempo, **faça o deploy da API primeiro**.

## Arquitetura

```
src/
├── index.tsx / App.tsx   # Providers globais, rotas e proteção por login
├── views/                # Uma pasta por tela (Home, GestaoCartao, GestaoFinanceira, Energia, Pessoa, Servidor, Login)
├── modulos/crescimento/  # Módulo independente (API /v1/crescimento): tipos, api, diálogos e telas
├── components/
│   ├── Layout/           # Menu lateral/inferior, cabeçalho, menu do usuário
│   ├── ui/               # Componentes genéricos (KpiCard, DataTable, Modal, PageHeader…)
│   ├── charts/           # Tema e componentes de gráfico
│   └── financas/         # Modal de transação, tabela de transações, cancelamento de parcelas
├── contexts/             # Estado por tela (GestaoCartao, GestaoFinanceira, Energia) e global (Auth, Pessoa, Toast)
├── services/             # Chamadas à API (axios) agrupadas por domínio
├── lib/financas/         # Cálculos puros: análise do cartão, projeções, visão mensal, parcelas
├── lib/pdf/              # Relatório de gastos do cartão (jsPDF)
├── hooks/                # Filtros de compra, dados externos (câmbio/FIPE)
├── config/urls.ts        # Todas as URLs da API num lugar só
├── styles/               # Tema MUI, tokens e cores
├── types/                # Tipos das respostas da API
└── utils/format.ts       # Moeda, datas, percentuais
```

- **Regra de negócio fica em `lib/`**, como funções puras sem React. Assim dá para testar e reaproveitar,
  e as views só montam a tela.
- **Cada tela grande tem um context** (`GestaoCartaoContext`, `GestaoFinanceiraContext`) que busca os
  dados uma vez e expõe o resultado já calculado para os componentes da tela.

**Módulo crescimento:** fica todo em `src/modulos/crescimento` e usa do casa só o cliente axios (`services/api`),
alguns componentes de `components/ui`, o `ToastContext` e o adaptador `diretorio.ts` (lista de usuários para convidar).
Para virar um app separado, leve a pasta e troque esses pontos.

## Integração com a API

- `services/api.ts` cria a instância do axios com `VITE_API_BASE_URL` e envia o token salvo como
  `Authorization: Bearer`. Se uma resposta vier 401, dispara o evento de sessão expirada e o app volta
  para o login.
- A sessão (token + usuário) fica no `localStorage` (`services/sessao.ts`).
- Erros da API vêm como `{ "mensagem": "..." }`; `apiErrorMessage` extrai o texto para mostrar ao usuário.
- **Contrato completo da API:** Swagger em `/casa-api/swagger-ui.html`.
- **Gestão de Cartão:** cada busca faz 2 chamadas, `GET /v1/compras/parcelas?de&ate` (3 meses antes até
  12 depois, separados por mês no front) e `GET /v1/compras?pessoa&cartao`. Com o filtro de última
  parcela, faz uma terceira. Evite voltar a buscar mês a mês.
- Câmbio (AwesomeAPI) e o valor FIPE atual (parallelum) são chamados direto do navegador; o histórico FIPE vem da API (`/v1/carros`).

## Convenções

- Textos da interface e nomes de domínio em português; código segue o mesmo vocabulário (compra,
  parcela, conta, lançamento, competência).
- Toda URL nova vai em `config/urls.ts`; toda chamada nova, num service de `services/`.
- Formatação com Prettier e lint com ESLint (`npm run check` precisa passar).

## Histórico de versões

Cada commit gera uma versão (major.minor.patch). A mais recente fica no topo.

### 1.0.1 — 23/11/2026

Esta versão adiciona uma verificação automática que impede o front de citar ou usar serviços de IA, para que dados pessoais nunca sejam enviados a eles.

- Novo script scripts/sem-ia.mjs, que procura referências a serviços de IA (Anthropic, OpenAI, Gemini, Ollama, LangChain e outros) em src, public, index.html, nginx.conf, vite.config.ts, package.json e package-lock.json
- Novo comando npm run sem-ia, incluído no npm run check e por isso executado em todo commit
- A verificação falha e lista arquivo e linha de cada referência encontrada; também falha se src ou package.json não existirem, para não aprovar sem ter conferido nada
- Ignorados na verificação: node_modules, dist, .saida e arquivos de imagem e fonte

### 1.0.0 — 23/11/2026

O Crescimento ganha a aba Exames para guardar e ver resultados em PDF ou foto, e deixa de ter o resumo do mês e as perguntas feitas à IA.

- Nova aba Exames no Crescimento: envio de PDF, JPG ou PNG de até 25 MB, com nome sugerido a partir do arquivo, data (não pode ser futura) e observação, e lista agrupada por ano
- Visualizador de exame em tela cheia: imagem na tela, PDF embutido (no celular, botão Abrir PDF), além de Baixar, Editar e Excluir com confirmação; o arquivo vem com login e é exibido por um endereço blob: local, sem link público
- Endpoints usados pela tela: GET/POST /v1/crescimento/{id}/exames, PUT/DELETE /v1/crescimento/{id}/exames/{exameId} e GET /v1/crescimento/{id}/exames/{exameId}/arquivo; a API precisa estar numa versão que já tenha esses endpoints
- Removido o cartão Resumo do mês da tela Início, junto com as perguntas à IA (deixam de ser chamados /v1/crescimento/{id}/resumos e /resumos/.../perguntas)
- CSP do nginx.conf passa a aceitar blob: em img-src, frame-src e object-src (antes object-src 'none'); é preciso recarregar o nginx no servidor
- robots.txt passa a bloquear todo o site para buscadores (Disallow: /)
- Teste e2e do Crescimento passa a enviar, abrir e excluir um exame em PDF; o rodar.sh cria o arquivo de marcação da pasta de fotos e exames no container da API

### 0.3.0 — 22/11/2026

Esta versão traz a nova tela Passagens, que acompanha preços de voos, organiza a Saúde do Servidor em abas (com Internet e Ventilação novas), troca o visual para um tema escuro e deixa o sistema instalável como aplicativo (PWA).

- Nova tela Passagens (/passagens, só para admin, no grupo Viagens do menu): cadastro de rotas com datas fixas ou janela de datas, escalas, passageiros, preço-alvo no formato brasileiro (sem centavos) e queda percentual para alerta; também mostra o histórico de preços por trecho e os alertas, e permite pausar ou remover rotas (com opção de apagar o histórico). Consome GET /v1/passagens e POST/PUT/DELETE /v1/passagens/rotas.
- Saúde do Servidor dividida em abas (Visão geral, Internet, Discos, Ventilação, Containers, Sistema e Histórico), com a aba aberta guardada na URL (?aba=…).
- Nova aba Internet com ping por destino, DNS, IP público, interface de rede e testes de velocidade. Consome /v1/servidor/internet, /v1/servidor/internet/dia e /v1/servidor/internet/velocidade.
- Nova aba Ventilação com o estado das ventoinhas enviado pelo Home Assistant, quanto falta para ligar por sensor (SoC, HDs e NVMe), períodos em que ficaram ligadas e tempo ligado por dia. Consome /v1/servidor/ventilacao, /v1/servidor/ventilacao/dia e /v1/servidor/ventilacao/dias.
- Card "Internet e rede" da aba Sistema trocado pelo card "VPN (Tailscale)", que lista os aparelhos da tailnet e mostra quais estão acessando o servidor agora.
- Novo tema escuro "Grafite" em todas as telas, com títulos na fonte Baloo 2, Inter servida localmente (sem Google Fonts) e cores de gráficos revisadas para daltonismo.
- Sistema instalável como aplicativo (PWA): manifest, ícones, atalhos para Crianças e Álbum e service worker que guarda só a casca do app (a API não entra no cache). O nginx.conf foi ajustado para não manter sw.js e manifest em cache. Para funcionar, o servidor precisa da versão da casa-api que tem os endpoints novos e do nginx.conf atualizado.
- Novos testes de ponta a ponta com Playwright (login, Crescimento, Passagens e Ventilação, no celular e no computador), rodados por `npm run e2e` num ambiente Docker isolado. Eles precisam da imagem local casa-api e do CASA_API_DIR.

### 0.2.0 — 22/11/2026

Novo módulo Crescimento para acompanhar as crianças da família. Ele reúne num lugar só o álbum de fotos dos mêsversários, o diário, as curvas da OMS, os marcos do desenvolvimento e as vacinas.

- Nova tela Crescimento (/crescimento) na seção Família do menu. Permite criar a família, convidar membros com permissão (PUT/DELETE /v1/crescimento/familias/{id}/membros) e cadastrar crianças com sexo e dados do nascimento.
- Nova aba Início com as últimas medidas e seus percentis, a agenda de compromissos (GET /v1/crescimento/criancas/{id}/agenda) e sugestões de brincadeiras.
- Nova aba Diário com a linha do tempo paginada (GET …/linha-do-tempo), filtro por tipo e opção de mostrar só registros com fotos. Permite registrar medições, consultas com retorno e fotos (endpoints …/registros e …/fotos).
- Nova aba Curvas com os gráficos de peso, comprimento e perímetro cefálico sobre as curvas da OMS, com faixas P3 a P97 e tabela de percentis (GET …/curvas/{indicador}).
- Nova aba Álbum em carrossel, com momentos por mês e momentos especiais, foto de capa e peso do dia. O momento pode ser compartilhado ou baixado como cartão em JPEG (endpoints …/album e …/album/especiais).
- Novas abas Marcos e Vacinas para marcar os marcos atingidos, com data e anotação, e registrar as doses aplicadas e as vacinas extras, com lote e local (endpoints …/marcos e …/vacinas).
- Nginx ajustado para aceitar o envio de fotos de até 30 MB (client_max_body_size 30m e proxy_request_buffering off); a configuração precisa ser aplicada no servidor. Adicionadas as fontes Inter, Baloo 2 e Caveat e a opção confirmDisabled no ConfirmDialog.
