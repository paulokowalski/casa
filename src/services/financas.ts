import { api, apiErrorMessage } from './api';
import { API_URLS } from '../config/urls';
import type { CompraInput, CompraRegistro, DespesaMes, Item, Parcela } from '../types/financas';

export const TODOS = 'TODOS';

async function lista<T>(url: string): Promise<T[]> {
  const res = await api.get<T[]>(url);
  return Array.isArray(res.data) ? res.data : [];
}

async function listaSegura<T>(url: string): Promise<T[]> {
  try {
    return await lista<T>(url);
  } catch {
    return [];
  }
}

export const filtrosService = {
  anos: () => listaSegura<Item>(API_URLS.FILTRO_ANOS),
  meses: (ano: string) => listaSegura<Item>(API_URLS.FILTRO_MESES(ano)),
  pessoas: (ano: string, mes: string) => listaSegura<Item>(API_URLS.FILTRO_PESSOAS(ano, mes)),
  cartoes: (ano: string, mes: string, pessoa: string) => listaSegura<Item>(API_URLS.FILTRO_CARTAO(ano, mes, pessoa)),
  categorias: () => listaSegura<Item>(API_URLS.FILTRO_CATEGORIAS),
  tiposLancamento: () => listaSegura<Item>(API_URLS.FILTRO_TIPOS_LANCAMENTOS),
};

export const comprasService = {
  async parcelasDoMes(
    ano: string | number,
    mes: string | number,
    pessoa: string,
    cartao = TODOS,
    ultimaParcela = TODOS,
  ): Promise<Parcela[]> {
    const res = await api.get<{ compras?: Parcela[] }>(
      API_URLS.COMPRA(ano, String(mes).padStart(2, '0'), pessoa, cartao || TODOS, ultimaParcela || TODOS),
    );
    return res.data?.compras ?? [];
  },

  async parcelasDoMesSeguro(
    ano: string | number,
    mes: string | number,
    pessoa: string,
    cartao = TODOS,
  ): Promise<Parcela[]> {
    try {
      return await comprasService.parcelasDoMes(ano, mes, pessoa, cartao);
    } catch {
      return [];
    }
  },

  todas: () => listaSegura<CompraRegistro>(API_URLS.COMPRA_ID()),

  async criar(dados: CompraInput): Promise<void> {
    try {
      await api.post(API_URLS.COMPRA_ID(), normalizar(dados));
    } catch (error) {
      throw new Error(apiErrorMessage(error, 'Não foi possível cadastrar a transação.'), { cause: error });
    }
  },

  async editar(id: string, dados: CompraInput): Promise<void> {
    try {
      await api.put(API_URLS.COMPRA_ID(id), normalizar(dados));
    } catch (error) {
      throw new Error(apiErrorMessage(error, 'Não foi possível salvar a transação.'), { cause: error });
    }
  },

  async excluir(id: string): Promise<void> {
    try {
      await api.delete(API_URLS.COMPRA_ID(id));
    } catch (error) {
      throw new Error(apiErrorMessage(error, 'Não foi possível excluir a transação.'), { cause: error });
    }
  },
};

export const despesasService = {
  async doMes(ano: string, mes: string, pessoa: string): Promise<DespesaMes | null> {
    try {
      const res = await api.get<DespesaMes>(API_URLS.DESPESA(ano, mes, pessoa));
      return res.data ?? null;
    } catch {
      return null;
    }
  },

  async doAno(ano: string, pessoa: string): Promise<Record<string, DespesaMes>> {
    try {
      const res = await api.get<{ despesasPorMes?: Record<string, DespesaMes> }>(API_URLS.DESPESA_SEM_MES(ano, pessoa));
      return res.data?.despesasPorMes ?? {};
    } catch {
      return {};
    }
  },
};

function normalizar(d: CompraInput) {
  return {
    nomeProduto: d.nomeProduto,
    valorProduto: Number(d.valorProduto),
    dataCompra: d.dataCompra,
    numeroParcelas: Number(d.numeroParcelas),
    nomePessoaCompra: d.nomePessoaCompra,
    tipoLancamentoId: d.tipoLancamentoId || null,
    categoriaId: d.categoriaId || null,
  };
}
