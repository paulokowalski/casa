export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type Valor = string | number;

const query = (params: Record<string, Valor>) =>
  '?' +
  Object.entries(params)
    .map(([chave, valor]) => `${chave}=${encodeURIComponent(String(valor))}`)
    .join('&');

export const API_URLS = {
  FIPE: 'https://parallelum.com.br/fipe/api/v2/cars/brands/26/models/9602/years/2027-5',
  DOLLAR: 'https://economia.awesomeapi.com.br/last/USD-BRL',
  EURO: 'https://economia.awesomeapi.com.br/last/EUR-BRL',

  AUTH_LOGIN: '/v1/auth/login',
  AUTH_ME: '/v1/auth/me',

  PESSOAS: '/v1/pessoas',
  PESSOA_ID: (id: Valor) => `/v1/pessoas/${id}`,

  DESPESA_SEM_MES: (ano: Valor, pessoa: Valor) => `/v1/despesas/${ano}${query({ pessoa })}`,

  COMPRA: (ano: Valor, mes: Valor, pessoa: Valor, cartao: Valor, ultimaParcela: Valor) =>
    `/v1/compras/parcelas/${ano}/${mes}${query({ pessoa, cartao, ultimaParcela })}`,
  COMPRA_PERIODO: (de: string, ate: string, pessoa: Valor, cartao: Valor) =>
    `/v1/compras/parcelas${query({ de, ate, pessoa, cartao })}`,
  COMPRAS: (pessoa: Valor, cartao: Valor) => `/v1/compras${query({ pessoa, cartao })}`,
  COMPRA_ID: (id?: Valor) => (id ? `/v1/compras/${id}` : `/v1/compras`),

  CONTAS: '/v1/contas',
  CONTA_ID: (id: string) => `/v1/contas/${id}`,
  CONTAS_LANCAMENTOS: '/v1/contas/lancamentos',
  CONTA_LANCAMENTO_ID: (id: string) => `/v1/contas/lancamentos/${id}`,
  RENDA: (ano: Valor, mes: Valor) => `/v1/rendas/${ano}/${Number(mes)}`,
  FATURA: (ano: Valor, mes: Valor) => `/v1/faturas/${ano}/${Number(mes)}`,

  FILTRO_ANOS: '/v1/filtros/anos',
  FILTRO_MESES: (ano: Valor) => `/v1/filtros/meses${query({ ano })}`,
  FILTRO_PESSOAS: (ano: Valor, mes: Valor) => `/v1/filtros/pessoas${query({ ano, mes })}`,
  FILTRO_CARTAO: (ano: Valor, mes: Valor, pessoa: Valor) => `/v1/filtros/cartoes${query({ ano, mes, pessoa })}`,
  FILTRO_CATEGORIAS: '/v1/filtros/categorias',
  FILTRO_TIPOS_LANCAMENTOS: '/v1/filtros/tipos-lancamento',

  GERACAO_SOLAR: (data: string) => `/v1/geracao-solar${query({ data })}`,
  GERACAO_SOLAR_ANO: (ano: Valor) => `/v1/geracao-solar/${ano}`,
  GERACAO_SOLAR_ANO_MES: (ano: Valor, mes: Valor) => `/v1/geracao-solar/${ano}/${mes}`,
  CARRO_FIPE: (codigoFipe: string) => `/v1/carros/${codigoFipe}`,

  SERVIDOR_AGORA: '/v1/servidor/agora',
  SERVIDOR_DIA: '/v1/servidor/dia',
  SERVIDOR_DIAS: '/v1/servidor/dias',
  SERVIDOR_HOST: '/v1/servidor/host',
  SERVIDOR_EVENTOS: '/v1/servidor/eventos',
};
