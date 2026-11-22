import { expect, test, type Locator, type Page } from '@playwright/test';
import { entrar, unico } from './apoio';

function daquiA(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Valor mostrado na seção de configuração da rota (lista dt/dd). */
function valor(cartao: Locator, rotulo: string): Locator {
  return cartao.locator(`dt:text-is("${rotulo}") + dd`);
}

/** A configuração (dl) do cartão da rota: o ancestral mais próximo do título que tem uma lista dt/dd. */
function cartaoDa(page: Page, nome: string): Locator {
  return page.getByRole('heading', { name: nome, exact: true }).locator('xpath=ancestor::*[.//dl][1]//dl');
}

test('cria rota com preço-alvo no formato brasileiro, pausa e remove', async ({ page }) => {
  await entrar(page);
  await page.goto('/passagens');

  await page.getByRole('button', { name: 'Nova rota' }).first().click();
  const form = page.getByRole('dialog', { name: 'Nova rota' });
  const nome = `Rota E2E ${unico()}`;
  await form.getByLabel('Nome').fill(nome);
  await form.getByLabel('Origem').fill('FOR');
  await form.getByLabel('Destino').fill('gru, cgh');
  await form.getByLabel('Ida', { exact: true }).fill(daquiA(60));
  await form.getByLabel('Volta', { exact: true }).fill(daquiA(67));
  await form.getByLabel('Escalas').click();
  await page.getByRole('option', { name: 'Só direto' }).click();
  await form.getByLabel('Adultos').click();
  await page.getByRole('option', { name: '2', exact: true }).click();

  // preço inválido ou com centavos mostra o erro no campo e trava o botão (antes "1500,50" virava 150050)
  const preco = form.getByLabel('Preço-alvo (R$)');
  const criar = form.getByRole('button', { name: 'Criar rota' });
  await preco.fill('1500,5,0');
  await expect(form.getByText('Valor inválido. Ex.: 1.500')).toBeVisible();
  await expect(criar).toBeDisabled();
  await preco.fill('1.500,50');
  await expect(form.getByText('Sem centavos: o alerta compara reais inteiros')).toBeVisible();
  await expect(criar).toBeDisabled();

  await preco.fill('1.500,00');
  await form.getByRole('button', { name: 'Criar rota' }).click();
  await expect(form).toBeHidden();

  const cartao = cartaoDa(page, nome);
  await expect(valor(cartao, 'Destino')).toHaveText('GRU, CGH');
  await expect(valor(cartao, 'Escalas')).toHaveText('só direto');
  await expect(valor(cartao, 'Passageiros')).toHaveText('2 adultos');
  await expect(valor(cartao, 'Preço-alvo')).toHaveText(/^R\$\s1\.500$/);

  // pausar: sai das ativas e aparece em "Rotas pausadas"
  await page.getByRole('button', { name: `Ações da rota ${nome}` }).click();
  await page.getByRole('menuitem', { name: 'Pausar monitoramento' }).click();
  // a rota pausada vira uma linha da lista (texto), não mais um cartão com título
  await expect(page.getByRole('heading', { name: 'Rotas pausadas' })).toBeVisible();
  await expect(page.getByRole('heading', { name: nome, exact: true })).toBeHidden();
  await expect(page.getByText(nome, { exact: true })).toBeVisible();

  // remover
  await page.getByRole('button', { name: `Ações da rota ${nome}` }).click();
  await page.getByRole('menuitem', { name: 'Remover' }).click();
  const confirmar = page.getByRole('dialog', { name: 'Remover rota' });
  await confirmar.getByRole('button', { name: 'Remover' }).click();
  await expect(confirmar).toBeHidden();
  await expect(page.getByText(nome, { exact: true })).toHaveCount(0);
});
