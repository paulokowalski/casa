import { expect, type Page } from '@playwright/test';

/** Credenciais do admin do banco de teste (criadas pelo e2e/rodar.sh). */
export const ADMIN = {
  email: process.env.E2E_EMAIL ?? 'admin@e2e.local',
  senha: process.env.E2E_SENHA ?? '',
};

export async function entrar(page: Page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(ADMIN.email);
  await page.getByLabel('Senha', { exact: true }).fill(ADMIN.senha);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

/** Sufixo único por execução, para os testes não colidirem entre si nem entre os projetos (celular/computador). */
export function unico(): string {
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}
