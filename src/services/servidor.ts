import { api, apiErrorMessage } from './api';
import { API_URLS } from '../config/urls';
import type {
  EventoServidor,
  InternetAgora,
  InternetDia,
  ServidorAgora,
  ServidorDia,
  ServidorHost,
  ServidorResumoDia,
  TesteVelocidade,
  VentilacaoAgora,
  VentilacaoDia,
  VentilacaoResumoDia,
} from '../types/servidor';

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

  internet: () => comErro(api.get<InternetAgora>(API_URLS.SERVIDOR_INTERNET), 'Não foi possível ler a internet agora.'),

  internetDia: (data: string) =>
    comErro(
      api.get<InternetDia>(API_URLS.SERVIDOR_INTERNET_DIA, { params: { data } }),
      'Não foi possível carregar a internet do dia.',
    ),

  velocidade: (de: string, ate: string) =>
    comErro(
      api.get<TesteVelocidade[]>(API_URLS.SERVIDOR_INTERNET_VELOCIDADE, { params: { de, ate } }),
      'Não foi possível carregar os testes de velocidade.',
    ),

  ventilacao: () =>
    comErro(api.get<VentilacaoAgora>(API_URLS.SERVIDOR_VENTILACAO), 'Não foi possível ler a ventilação agora.'),

  ventilacaoDia: (data: string) =>
    comErro(
      api.get<VentilacaoDia>(API_URLS.SERVIDOR_VENTILACAO_DIA, { params: { data } }),
      'Não foi possível carregar a ventilação do dia.',
    ),

  ventilacaoDias: (de: string, ate: string) =>
    comErro(
      api.get<VentilacaoResumoDia[]>(API_URLS.SERVIDOR_VENTILACAO_DIAS, { params: { de, ate } }),
      'Não foi possível carregar o tempo ligada por dia.',
    ),
};
