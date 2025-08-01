export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_URLS = {
  FIPE: 'https://parallelum.com.br/fipe/api/v2/cars/brands/23/models/9048/years/2021-5',
  DOLLAR: 'https://economia.awesomeapi.com.br/last/USD-BRL',
  EURO: 'https://economia.awesomeapi.com.br/last/EUR-BRL',
  TRANSACOES: '/v1/transacoes',
  TRANSACAO_ID: (id: string|number) => `/v1/transacoes/${id}`,
  TRANSACAO_SERIE: (idSerie: string) => `/v1/transacoes/serie/${idSerie}`,
  PESSOAS: '/v1/pessoas',
  PESSOA_ID: (id: string|number) => `/v1/pessoas/${id}`,
  DESPESA: (ano: string|number, mes: string|number, pessoa: string|number) => `/v1/despesa/${ano}/${mes}/${pessoa}`,
  DESPESA_SEM_MES: (ano: string|number, pessoa: string|number) => `/v1/despesa/${ano}/${pessoa}`,
  COMPRA: (ano: string|number, mes: string|number, pessoa: string|number, cartao: string|number, ultimaParcela: string|number) => `/v1/compra/${ano}/${mes}/${pessoa}/${cartao}/${ultimaParcela}`,
  COMPRA_SEM_CARTAO: (ano: string|number, mes: string|number, pessoa: string|number) => `/v1/compra/${ano}/${mes}/${pessoa}/TODOS/TODOS`,
  COMPRA_ID: (id?: string|number) => id ? `/v1/compra/${id}` : `/v1/compra`,
  FILTRO_ANOS: '/v1/filtro/anos',
  FILTRO_MESES: (ano: string|number) => `/v1/filtro/meses/${ano}`,
  FILTRO_PESSOAS: (ano: string|number, mes: string|number) => `/v1/filtro/pessoas/${ano}/${mes}`,
  FILTRO_CARTAO: (ano: string|number, mes: string|number, pessoa: string|number) => `/v1/filtro/cartao/${ano}/${mes}/${pessoa}`,

  //TRANSACOES
  TRANSACOES_PROXIMOS_30_DIAS: '/v1/transacoes/proximos-30-dias',
  
  // URLs de Energia Solar
  GERACAO_SOLAR: (data: string) => `/v1/geracao-solar?data=${data}`,
  GERACAO_SOLAR_ANO: (ano: string|number) => `/v1/geracao-solar/ano/${ano}`,
  GERACAO_SOLAR_ANO_MES: (ano: string|number, mes: string|number) => `/v1/geracao-solar/ano/${ano}/mes/${mes}`,
  
  API_BRASILEIRAO_POSICAO: (idTime: string|number) =>`/v1/brasileirao-serie-a/posicao/${idTime}`,
  API_BRASILEIRAO_RODADA: (idTime: string|number) => `/v1/brasileirao-serie-a/rodada-atual/${idTime}`,
}; 