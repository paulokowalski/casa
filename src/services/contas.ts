import { api, apiErrorMessage } from './api';
import { API_URLS } from '../config/urls';
import type { Competencia, Conta, ContaInput, FaturaStatus, Lancamento, LancamentoInput, Renda } from '../types/contas';

/** Acesso a /v1/contas (contas fora do cartão) e /v1/renda. */

async function comErro<T>(promessa: Promise<{ data: T }>, mensagem: string): Promise<T> {
  try {
    return (await promessa).data;
  } catch (error) {
    throw new Error(apiErrorMessage(error, mensagem), { cause: error });
  }
}

export const contasService = {
  listar: (pessoaId: number) =>
    comErro(api.get<Conta[]>(API_URLS.CONTAS, { params: { pessoaId } }), 'Não foi possível carregar as contas.'),

  criar: (dados: ContaInput) => comErro(api.post<Conta>(API_URLS.CONTAS, dados), 'Não foi possível cadastrar a conta.'),

  /** Os meses não pagos a partir de `aPartirDe` passam a usar os novos dados */
  editar: (id: string, dados: ContaInput, aPartirDe: Competencia) =>
    comErro(
      api.put<Conta>(API_URLS.CONTA_ID(id), dados, { params: { aPartirDe } }),
      'Não foi possível salvar a conta.',
    ),

  /** Com `aPartirDe`: encerra a conta antes desse mês. Sem: apaga a conta e todo o histórico. */
  excluir: (id: string, aPartirDe?: Competencia) =>
    comErro(
      api.delete<void>(API_URLS.CONTA_ID(id), { params: aPartirDe ? { aPartirDe } : {} }),
      'Não foi possível excluir a conta.',
    ),

  lancamentos: (pessoaId: number, de: Competencia, ate: Competencia) =>
    comErro(
      api.get<Lancamento[]>(API_URLS.CONTAS_LANCAMENTOS, { params: { pessoaId, de, ate } }),
      'Não foi possível carregar as contas do mês.',
    ),

  atualizarLancamento: (id: string, dados: LancamentoInput) =>
    comErro(api.patch<Lancamento>(API_URLS.CONTA_LANCAMENTO_ID(id), dados), 'Não foi possível atualizar a conta.'),
};

export const faturaService = {
  obter: (ano: number, mes: number, pessoaId: number) =>
    comErro(
      api.get<FaturaStatus>(API_URLS.FATURA(ano, mes), { params: { pessoaId } }),
      'Não foi possível carregar a situação da fatura.',
    ),

  salvar: (ano: number, mes: number, pessoaId: number, paga: boolean) =>
    comErro(
      api.put<FaturaStatus>(API_URLS.FATURA(ano, mes), { paga }, { params: { pessoaId } }),
      'Não foi possível atualizar a fatura.',
    ),
};

export const rendaService = {
  obter: (ano: number, mes: number, pessoaId: number) =>
    comErro(api.get<Renda>(API_URLS.RENDA(ano, mes), { params: { pessoaId } }), 'Não foi possível carregar a renda.'),

  salvar: (ano: number, mes: number, pessoaId: number, valor: number | null) =>
    comErro(
      api.put<Renda>(API_URLS.RENDA(ano, mes), { valor }, { params: { pessoaId } }),
      'Não foi possível salvar a renda.',
    ),
};
