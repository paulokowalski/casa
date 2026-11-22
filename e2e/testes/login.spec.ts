import { expect, test } from '@playwright/test';
import { ADMIN, entrar } from './apoio';

test('sem login, qualquer tela leva para o login', async ({ page }) => {
  await page.goto('/crescimento');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
});

test('senha errada mostra erro e continua no login', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(ADMIN.email);
  await page.getByLabel('Senha', { exact: true }).fill('senha-errada');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test('admin entra e chega na tela inicial', async ({ page }) => {
  await entrar(page);
  await expect(page).toHaveURL(/\/$/);
});
