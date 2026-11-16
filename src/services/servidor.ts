import { api, apiErrorMessage } from './api';
import { API_URLS } from '../config/urls';
import type { EventoServidor, ServidorAgora, ServidorDia, ServidorHost, ServidorResumoDia } from '../types/servidor';

async function comErro<T>(promessa: Promise<{ data: T }>, mensagem: string): Promise<T> {
  try {
    return (await promessa).data;
  } catch (error) {
    throw new Error(apiErrorMessage(error, mensagem), { cause: error });
  }
}

export const servidorService = {
  agora: () =>
    comErro(api.get<ServidorAgora>(API_URLS.SERVIDOR_AGORA), 'Não foi possível ler o estado atual do servidor.'),

  dia: (data: string) =>
    comErro(api.get<ServidorDia>(API_URLS.SERVIDOR_DIA, { params: { data } }), 'Não foi possível carregar o dia.'),

  host: () => comErro(api.get<ServidorHost>(API_URLS.SERVIDOR_HOST), 'Não foi possível ler o status do host.'),

  eventos: (de: string, ate: string) =>
    comErro(
      api.get<EventoServidor[]>(API_URLS.SERVIDOR_EVENTOS, { params: { de, ate } }),
      'Não foi possível carregar os eventos.',
    ),

  dias: (de: string, ate: string) =>
    comErro(
      api.get<ServidorResumoDia[]>(API_URLS.SERVIDOR_DIAS, { params: { de, ate } }),
      'Não foi possível carregar as estatísticas diárias.',
    ),
};
