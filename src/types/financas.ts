/** Tipos compartilhados das telas de cartão e de gestão financeira (contrato do casa-api). */

/** Item de filtro devolvido por /v1/filtro/* */
export interface Item {
  codigo: string;
  descricao: string;
}

/** Uma parcela de compra em um mês — GET /v1/compra/{ano}/{mes}/{pessoa}/{cartao}/{ultimaParcela} */
export interface Parcela {
  id: string;
  dataParcela: string;
  dataCompra: string;
  nomeCompra: string;
  nomeCartao: string;
  nomePessoa: string;
  numeroParcela: number;
  numeroTotalParcela: number;
  ultimaParcela: 'SIM' | 'NÃO' | string;
  valorFaltante: number;
  valorParcela: number;
  valorTotal: number;
  categoria?: string;
}

/** Compra completa — GET /v1/compra */
export interface CompraRegistro {
  id: string;
  nomeProduto: string;
  valorProduto: number;
  dataCompra: string;
  numeroParcelas: number;
  nomePessoaCompra: string;
  nomeCartao: string;
}

/** Corpo de POST/PUT /v1/compra */
export interface CompraInput {
  nomeProduto: string;
  valorProduto: number;
  dataCompra: string; // yyyy-MM-dd
  numeroParcelas: number;
  nomePessoaCompra: string; // várias pessoas separadas por vírgula
  tipoLancamentoId: string;
  categoriaId?: string | null;
}

/** GET /v1/despesa/{ano}/{mes}/{pessoa} */
export interface DespesaMes {
  valorMes: number;
  comprasParceladas: number;
  gastosNoCartao: number;
}
