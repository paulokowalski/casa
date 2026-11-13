export interface Item {
  codigo: string;
  descricao: string;
}

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

export interface CompraRegistro {
  id: string;
  nomeProduto: string;
  valorProduto: number;
  dataCompra: string;
  numeroParcelas: number;
  nomePessoaCompra: string;
  nomeCartao: string;
}

export interface CompraInput {
  nomeProduto: string;
  valorProduto: number;
  dataCompra: string;
  numeroParcelas: number;
  nomePessoaCompra: string;
  tipoLancamentoId: string;
  categoriaId?: string | null;
}

export interface DespesaMes {
  valorMes: number;
  comprasParceladas: number;
  gastosNoCartao: number;
}
