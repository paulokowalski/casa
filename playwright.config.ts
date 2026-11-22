import { defineConfig, devices } from '@playwright/test';

/**
 * Testes de ponta a ponta da tela (e2e/testes). Rodam pelo e2e/rodar.sh, que sobe bancos de teste, a casa-api e o
 * site num ambiente isolado e passa o endereço em E2E_URL. Rodar à mão: npm run e2e
 */
export default defineConfig({
  testDir: 'e2e/testes',
  outputDir: 'e2e/.saida/resultados',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_URL ?? 'http://localhost:3000',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'celular', use: { ...devices['Pixel 7'] } },
    { name: 'computador', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 860 } } },
  ],
});
