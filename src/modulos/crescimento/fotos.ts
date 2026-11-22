import { crescimentoApi } from './api';

/** Apaga as fotos enviadas num formulário que foi cancelado. */
export async function descartarNovas(novas: Set<string>, manter: string[] = []) {
  const apagar = [...novas].filter((id) => !manter.includes(id));
  novas.clear();
  await Promise.allSettled(apagar.map((id) => crescimentoApi.excluirFoto(id)));
}
