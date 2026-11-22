import { api, apiErrorMessage } from './api';
import { API_URLS } from '../config/urls';
import type { Passagens, RotaPassagem, RotaPassagemInput } from '../types/passagens';

async function comErro<T>(promessa: Promise<{ data: T }>, mensagem: string): Promise<T> {
  try {
    return (await promessa).data;
  } catch (error) {
    throw new Error(apiErrorMessage(error, mensagem), { cause: error });
  }
}

export const passagensService = {
  /** @param dias dias de histórico no gráfico (0 = tudo) */
  listar: (dias: number) =>
    comErro(
      api.get<Passagens>(API_URLS.PASSAGENS, { params: { dias } }),
      'Não foi possível carregar o histórico de passagens.',
    ),

  criarRota: (rota: RotaPassagemInput) =>
    comErro(api.post<RotaPassagem>(API_URLS.PASSAGENS_ROTAS, rota), 'Não foi possível criar a rota.'),

  /** Também serve para pausar/retomar (ativa). */
  atualizarRota: (id: number, rota: RotaPassagemInput) =>
    comErro(api.put<RotaPassagem>(API_URLS.PASSAGENS_ROTA_ID(id), rota), 'Não foi possível salvar a rota.'),

  /** @param historico true = apaga também os preços e alertas da rota */
  removerRota: (id: number, historico: boolean) =>
    comErro(
      api.delete<void>(API_URLS.PASSAGENS_ROTA_ID(id), { params: { historico } }),
      'Não foi possível remover a rota.',
    ),
};
