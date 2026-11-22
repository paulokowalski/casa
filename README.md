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

| Rota                 | Tela                         | O que mostra                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/login`             | Login                        | E-mail e senha; a sessão fica salva no navegador até o token expirar                                                                                                                                                                                                                                                                                                                           |
| `/`                  | Dashboard                    | Resumo do dia: câmbio (dólar/euro), valor do carro (FIPE atual e histórico), potência e geração solar                                                                                                                                                                                                                                                                                          |
| `/gestao-cartao`     | Gestão de Cartão             | Gastos do mês por pessoa/cartão, saúde financeira, insights, gráficos (categoria, cartão, dia da semana, maiores gastos), próximos 12 meses, cadastro/edição/cancelamento de parcelas, exportação em PDF                                                                                                                                                                                       |
| `/gestao-financeira` | Gestão Financeira            | Contas fixas, financiamentos e cartão juntos: regra 50/30/20 sobre a renda, evolução de 12 meses, previsão de custo e sobra, onde economizar                                                                                                                                                                                                                                                   |
| `/energia`           | Energia Solar                | Geração dos painéis por dia, mês e ano                                                                                                                                                                                                                                                                                                                                                         |
| `/crescimento`       | Crescimento                  | Crianças da família: início (aviso de mêsversário, medidas, agenda, fotos), álbum (mêsversários, primeiras vezes, momentos especiais, cartão para compartilhar), diário, curvas da OMS, marcos e vacinas. Módulo em `src/modulos/crescimento`                                                                                                                                                  |
| `/pessoa`            | Pessoas (só admin)           | Quem tem compras no sistema e quem pode entrar (senha, papel, ativo)                                                                                                                                                                                                                                                                                                                           |
| `/servidor`          | Saúde do Servidor (só admin) | CPU (total e por núcleo), memória, swap, temperaturas (placa e discos), carga, discos, rede e containers Docker ao vivo (a cada 15 s); histórico de um dia em gráficos a cada 5 min, com CPU/memória por container e o tempo que cada um ficou fora do ar; estatísticas diárias dos últimos 30 dias. Os dados vêm de `/v1/servidor/*` do casa-api, que grava uma amostra por minuto no MariaDB |

Todas as rotas, menos `/login`, exigem sessão. As telas carregam sob demanda (`React.lazy`).

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

| Comando                           | O que faz                                                |
| --------------------------------- | -------------------------------------------------------- |
| `npm run dev`                     | Servidor de desenvolvimento (Vite) na porta 3000         |
| `npm run build`                   | Build de produção em `dist/`                             |
| `npm run preview`                 | Serve o build localmente                                 |
| `npm run typecheck`               | `tsc --noEmit`                                           |
| `npm run lint` / `lint:fix`       | ESLint                                                   |
| `npm run format` / `format:check` | Prettier                                                 |
| `npm run check`                   | typecheck + lint + format:check (rode antes de commitar) |

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

### 0.2.0 — 22/11/2026

Novo módulo Crescimento para acompanhar as crianças da família. Ele reúne num lugar só o álbum de fotos dos mêsversários, o diário, as curvas da OMS, os marcos do desenvolvimento, as vacinas e resumos mensais feitos por IA.

- Nova tela Crescimento (/crescimento) na seção Família do menu. Permite criar a família, convidar membros com permissão (PUT/DELETE /v1/crescimento/familias/{id}/membros) e cadastrar crianças com sexo e dados do nascimento.
- Nova aba Início com as últimas medidas e seus percentis, a agenda de compromissos (GET /v1/crescimento/criancas/{id}/agenda) e sugestões de brincadeiras.
- Nova aba Diário com a linha do tempo paginada (GET …/linha-do-tempo), filtro por tipo e opção de mostrar só registros com fotos. Permite registrar medições, consultas com retorno e fotos (endpoints …/registros e …/fotos).
- Nova aba Curvas com os gráficos de peso, comprimento e perímetro cefálico sobre as curvas da OMS, com faixas P3 a P97 e tabela de percentis (GET …/curvas/{indicador}).
- Nova aba Álbum em carrossel, com momentos por mês e momentos especiais, foto de capa e peso do dia. O momento pode ser compartilhado ou baixado como cartão em JPEG (endpoints …/album e …/album/especiais).
- Novas abas Marcos e Vacinas para marcar os marcos atingidos, com data e anotação, e registrar as doses aplicadas e as vacinas extras, com lote e local (endpoints …/marcos e …/vacinas).
- Novo resumo do mês de vida gerado por IA, com conversa de perguntas e respostas sobre o mês (endpoints …/resumos/{mes} e …/resumos/{mes}/perguntas).
- Nginx ajustado para aceitar o envio de fotos de até 30 MB (client_max_body_size 30m e proxy_request_buffering off); a configuração precisa ser aplicada no servidor. Adicionadas as fontes Inter, Baloo 2 e Caveat e a opção confirmDisabled no ConfirmDialog.
