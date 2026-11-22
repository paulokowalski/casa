import { expect, test } from '@playwright/test';
import { entrar } from './apoio';

test('aba Ventilação mostra a leitura enviada pelo Home Assistant e quanto falta para ligar', async ({
  page,
  request,
}) => {
  // faz o papel do Home Assistant: grava uma leitura com a chave de integração
  const gravou = await request.post('/casa-api/v1/servidor/ventilacao', {
    headers: { 'X-API-KEY': process.env.E2E_API_KEY ?? '' },
    data: {
      tomada: 'on',
      precisa: true,
      automatica: true,
      soc: 48.5,
      hds: 41,
      nvme: 52,
      limiteSoc: { liga: 55, desliga: 48 },
      limiteHds: { liga: 55, desliga: 45 },
      limiteNvme: { liga: 60, desliga: 55 },
    },
  });
  expect(gravou.status()).toBe(204);

  await entrar(page);
  await page.goto('/servidor?aba=ventilacao');

  await expect(page.getByRole('tab', { name: 'Ventilação', selected: true })).toBeVisible();
  await expect(page.getByText('Ligadas', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Quanto falta para ligar' })).toBeVisible();
  // o mais perto de ligar é o SoC: 55 − 48,5
  await expect(page.getByText('Faltam 6,5 °C', { exact: true })).toBeVisible();
  await expect(page.getByText('liga em 60,0 °C · desliga abaixo de 55,0 °C')).toBeVisible();
});
