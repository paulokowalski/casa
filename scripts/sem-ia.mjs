// Regra do sistema: dados pessoais nunca vão para IA. Falha se o front citar ou usar um serviço de IA
// (no código, nas páginas, no nginx ou nas dependências). Roda no `npm run check`, portanto em todo commit.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath: com .pathname, espaços e acentos no caminho viram %20/%C3%A7 e nenhum arquivo seria achado
const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const ALVOS = ['src', 'public', 'index.html', 'nginx.conf', 'vite.config.ts', 'package.json', 'package-lock.json'];
// sem estes, a verificação não teria o que conferir: falha em vez de dizer "ok"
const OBRIGATORIOS = ['src', 'package.json'];
const IGNORAR = new Set(['node_modules', 'dist', '.saida']);
const IA =
  /anthropic|openai|\bclaude\b|gemini|chatgpt|\bgpt-\d|ollama|\bllm\b|mistral\.ai|cohere|huggingface|langchain|@ai-sdk|bedrock|vertex\s*ai|copilot|perplexity|replicate\.com|groq\b|deepseek/i;

function* arquivos(caminho) {
  if (!existsSync(caminho)) return; // alvo opcional ausente (ex.: public)
  const info = statSync(caminho);
  if (info.isFile()) {
    yield caminho;
    return;
  }
  for (const nome of readdirSync(caminho)) if (!IGNORAR.has(nome)) yield* arquivos(join(caminho, nome));
}

const faltando = OBRIGATORIOS.filter((alvo) => !existsSync(join(RAIZ, alvo)));
if (faltando.length > 0) {
  console.error(`sem-ia: não achei ${faltando.join(', ')} em ${RAIZ}; a verificação não conferiu nada.`);
  process.exit(1);
}

const violacoes = [];
let lidos = 0;
for (const alvo of ALVOS) {
  for (const arq of arquivos(join(RAIZ, alvo))) {
    if (/\.(png|jpe?g|gif|ico|webp|woff2?|ttf)$/i.test(arq)) continue;
    lidos++;
    readFileSync(arq, 'utf8')
      .split('\n')
      .forEach((linha, i) => {
        if (IA.test(linha)) violacoes.push(`${relative(RAIZ, arq)}:${i + 1}: ${linha.trim().slice(0, 160)}`);
      });
  }
}

if (violacoes.length > 0) {
  console.error('Dados pessoais não podem ir para serviços de IA. Remova as referências abaixo:');
  for (const v of violacoes) console.error(`  ${v}`);
  process.exit(1);
}
console.log(`sem IA: ok (${lidos} arquivos conferidos)`);
