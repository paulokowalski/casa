import { api, apiErrorMessage } from '../../services/api';
import type {
  Album,
  AlbumInput,
  Compromisso,
  Crianca,
  CriancaInput,
  Curva,
  Familia,
  Foto,
  Indicador,
  LinhaDoTempo,
  Marco,
  Marcos,
  Papel,
  Registro,
  RegistroInput,
  PerguntaIa,
  Resumo,
  ResumoMes,
  ResumosMes,
  TipoRegistro,
  VacinaExtra,
  VacinaInput,
  Vacinas,
  Dose,
} from './tipos';

const BASE = '/v1/crescimento';
const C = (id: string) => `${BASE}/criancas/${id}`;

async function chamar<T>(promessa: Promise<{ data: T }>, mensagem: string): Promise<T> {
  try {
    return (await promessa).data;
  } catch (error) {
    throw new Error(apiErrorMessage(error, mensagem), { cause: error });
  }
}

export const crescimentoApi = {
  familias: () => chamar(api.get<Familia[]>(`${BASE}/familias`), 'Não foi possível carregar as famílias.'),
  criarFamilia: (nome: string) =>
    chamar(api.post<Familia>(`${BASE}/familias`, { nome }), 'Não foi possível criar a família.'),
  salvarMembro: (familiaId: string, usuarioId: number, papel: Papel) =>
    chamar(
      api.put<Familia>(`${BASE}/familias/${familiaId}/membros`, { usuarioId, papel }),
      'Não foi possível salvar o membro.',
    ),
  removerMembro: (familiaId: string, usuarioId: number) =>
    chamar(
      api.delete<void>(`${BASE}/familias/${familiaId}/membros/${usuarioId}`),
      'Não foi possível remover o membro.',
    ),

  criancas: (familiaId: string) =>
    chamar(api.get<Crianca[]>(`${BASE}/familias/${familiaId}/criancas`), 'Não foi possível carregar as crianças.'),
  criarCrianca: (familiaId: string, dados: CriancaInput) =>
    chamar(api.post<Crianca>(`${BASE}/familias/${familiaId}/criancas`, dados), 'Não foi possível cadastrar a criança.'),
  atualizarCrianca: (id: string, dados: CriancaInput) =>
    chamar(api.put<Crianca>(C(id), dados), 'Não foi possível salvar os dados da criança.'),
  excluirCrianca: (id: string) => chamar(api.delete<void>(C(id)), 'Não foi possível excluir.'),

  resumo: (id: string) => chamar(api.get<Resumo>(`${C(id)}/resumo`), 'Não foi possível carregar o resumo.'),
  curva: (id: string, indicador: Indicador) =>
    chamar(api.get<Curva>(`${C(id)}/curvas/${indicador}`), 'Não foi possível carregar a curva.'),
  excluirMedicao: (id: string, medicaoId: string) =>
    chamar(api.delete<void>(`${C(id)}/medicoes/${medicaoId}`), 'Não foi possível excluir a medição.'),

  enviarFoto: (id: string, arquivo: File) => {
    const form = new FormData();
    form.append('arquivo', arquivo);
    return chamar(
      api.post<Foto>(`${C(id)}/fotos`, form, { timeout: 120_000 }),
      `Não foi possível enviar ${arquivo.name}.`,
    );
  },
  excluirFoto: (fotoId: string) =>
    chamar(api.delete<void>(`${BASE}/fotos/${fotoId}`), 'Não foi possível apagar a foto.'),

  linhaDoTempo: (
    id: string,
    opcoes: { pagina?: number; tamanho?: number; tipo?: TipoRegistro | null; soComFotos?: boolean },
  ) =>
    chamar(
      api.get<LinhaDoTempo>(`${C(id)}/linha-do-tempo`, {
        params: {
          pagina: opcoes.pagina ?? 0,
          tamanho: opcoes.tamanho ?? 20,
          tipo: opcoes.tipo ?? undefined,
          soComFotos: opcoes.soComFotos || undefined,
        },
      }),
      'Não foi possível carregar a linha do tempo.',
    ),
  criarRegistro: (id: string, dados: RegistroInput) =>
    chamar(api.post<Registro>(`${C(id)}/registros`, dados), 'Não foi possível salvar o registro.'),
  atualizarRegistro: (id: string, registroId: string, dados: RegistroInput) =>
    chamar(api.put<Registro>(`${C(id)}/registros/${registroId}`, dados), 'Não foi possível salvar o registro.'),
  registro: (id: string, registroId: string) =>
    chamar(api.get<Registro>(`${C(id)}/registros/${registroId}`), 'Não foi possível carregar o registro.'),
  excluirRegistro: (id: string, registroId: string) =>
    chamar(api.delete<void>(`${C(id)}/registros/${registroId}`), 'Não foi possível excluir o registro.'),

  album: (id: string) => chamar(api.get<Album>(`${C(id)}/album`), 'Não foi possível carregar o álbum.'),
  salvarNoAlbum: (id: string, chave: string, dados: AlbumInput) =>
    chamar(api.put<Registro>(`${C(id)}/album/${chave}`, dados), 'Não foi possível guardar no álbum.'),
  novoEspecial: (id: string, dados: AlbumInput) =>
    chamar(api.post<Registro>(`${C(id)}/album/especiais`, dados), 'Não foi possível criar o momento.'),
  tirarDoAlbum: (id: string, chave: string) =>
    chamar(api.delete<void>(`${C(id)}/album/${chave}`), 'Não foi possível tirar do álbum.'),

  marcos: (id: string) => chamar(api.get<Marcos>(`${C(id)}/marcos`), 'Não foi possível carregar os marcos.'),
  marcar: (id: string, marcoId: string, atingidoEm?: string, nota?: string) =>
    chamar(api.put<Marco>(`${C(id)}/marcos/${marcoId}`, { atingidoEm, nota }), 'Não foi possível marcar.'),
  desmarcar: (id: string, marcoId: string) =>
    chamar(api.delete<void>(`${C(id)}/marcos/${marcoId}`), 'Não foi possível desmarcar.'),

  vacinas: (id: string) => chamar(api.get<Vacinas>(`${C(id)}/vacinas`), 'Não foi possível carregar as vacinas.'),
  aplicarVacina: (id: string, vacinaId: string, dados: VacinaInput) =>
    chamar(api.put<Dose>(`${C(id)}/vacinas/${vacinaId}`, dados), 'Não foi possível registrar a vacina.'),
  aplicarExtra: (id: string, dados: VacinaInput & { nome: string }) =>
    chamar(api.post<VacinaExtra>(`${C(id)}/vacinas/extras`, dados), 'Não foi possível registrar a vacina.'),
  removerVacina: (id: string, vacinaId: string) =>
    chamar(api.delete<void>(`${C(id)}/vacinas/${vacinaId}`), 'Não foi possível desfazer.'),

  agenda: (id: string) => chamar(api.get<Compromisso[]>(`${C(id)}/agenda`), 'Não foi possível carregar a agenda.'),

  resumosMes: (id: string) =>
    chamar(api.get<ResumosMes>(`${C(id)}/resumos`), 'Não foi possível carregar os resumos do mês.'),
  gerarResumoMes: (id: string, mes: number) =>
    chamar(api.post<ResumoMes>(`${C(id)}/resumos/${mes}`), 'Não foi possível gerar o resumo.'),
  perguntarIa: (id: string, mes: number, pergunta: string) =>
    chamar(
      api.post<PerguntaIa>(`${C(id)}/resumos/${mes}/perguntas`, { pergunta }),
      'Não foi possível enviar a pergunta.',
    ),
  excluirPerguntaIa: (id: string, perguntaId: string) =>
    chamar(api.delete<void>(`${C(id)}/resumos/perguntas/${perguntaId}`), 'Não foi possível apagar a pergunta.'),
};
