import { expect, test } from '@playwright/test';
import { entrar, unico } from './apoio';

function diasAtras(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

test('cadastra criança e pesagem no diário; peso inválido trava o salvar', async ({ page }) => {
  await entrar(page);
  await page.goto('/crescimento');

  // primeira vez no banco de teste: cria a família; depois ela já existe
  const nomeFamilia = page.getByLabel('Nome da família');
  const cadastrar = page.getByRole('button', { name: 'Cadastrar criança' });
  const maisOpcoes = page.getByRole('button', { name: 'Mais opções' });
  await expect(nomeFamilia.or(cadastrar).or(maisOpcoes).first()).toBeVisible();
  if (await nomeFamilia.isVisible()) {
    await nomeFamilia.fill('Família E2E');
    await page.getByRole('button', { name: 'Criar' }).click();
  }
  // família nova já abre o cadastro da primeira criança sozinha
  const novaCrianca = page.getByRole('dialog', { name: 'Nova criança' });
  await expect(novaCrianca.or(cadastrar).or(maisOpcoes).first()).toBeVisible();
  if (!(await novaCrianca.isVisible())) {
    if (await cadastrar.isVisible()) {
      await cadastrar.click();
    } else {
      await maisOpcoes.click();
      await page.getByRole('menuitem', { name: 'Nova criança' }).click();
    }
  }

  const nome = `Bebe${unico()}`;
  const criancaDialog = novaCrianca;
  await criancaDialog.getByLabel('Nome', { exact: true }).fill(`${nome} Teste`);
  await criancaDialog.getByLabel('Nascimento').fill(diasAtras(60));
  await criancaDialog.getByLabel('Menina').check();
  await criancaDialog.getByRole('button', { name: 'Salvar' }).click();
  await expect(criancaDialog).toBeHidden();

  // com mais de uma criança aparece um chip por criança (o nome exato evita o cartão "Oi …!" do Início)
  const chip = page.getByRole('button', { name: nome, exact: true });
  if ((await chip.count()) > 0) await chip.click();
  await expect(page.getByText(`${nome} Teste`, { exact: true }).first()).toBeVisible();
  await page.getByRole('tab', { name: 'Diário' }).click();
  await page.getByRole('button', { name: 'Registrar' }).click();

  const registro = page.getByRole('dialog');
  await registro.getByRole('button', { name: 'Pesagem' }).click();
  const peso = registro.getByLabel('Peso (kg)');
  const salvar = registro.getByRole('button', { name: 'Salvar' });

  await peso.fill('5,1kg');
  await expect(registro.getByText('Use só números, ex.: 3,25')).toBeVisible();
  await expect(salvar).toBeDisabled();

  await peso.fill('5,1');
  await expect(salvar).toBeEnabled();
  await salvar.click();
  await expect(registro).toBeHidden();

  await expect(page.getByText(/5,100 kg/)).toBeVisible();
});
