import type { Lancamento } from '../../types/contas';
import { arred, mesIdx, rotuloMesAno, somar } from './parcelas';
import type { MesFuturo } from './proximosMeses';

export interface PontoFuturo {
  idx: number;
  rotulo: string;
  contas: number;
  parcelas: number;
  total: number;
  sobra: number | null;
}

export interface Futuro {
  pontos: PontoFuturo[];
  renda: number | null;
}

const idxDe = (competencia: string) =>
  mesIdx({ ano: Number(competencia.slice(0, 4)), mes: Number(competencia.slice(5, 7)) });

export function calcularFuturo(
  refIdx: number,
  lancamentos: Lancamento[],
  cartao: MesFuturo[],
  renda: number | null,
): Futuro {
  const contasPorMes = new Map<number, number>();
  lancamentos.forEach((l) => {
    const i = idxDe(l.competencia);
    contasPorMes.set(i, (contasPorMes.get(i) ?? 0) + l.valor);
  });
  const cartaoPorMes = new Map(cartao.map((m) => [m.idx, m.parcelas]));
  const rendaValida = renda && renda > 0 ? renda : null;

  const pontos = Array.from({ length: 12 }, (_, k): PontoFuturo => {
    const idx = refIdx + 1 + k;
    const parcelas = arred(somar((cartaoPorMes.get(idx) ?? []).map((p) => Number(p.valorParcela) || 0)));
    const contas = arred(contasPorMes.get(idx) ?? 0);
    const total = arred(contas + parcelas);
    return {
      idx,
      rotulo: rotuloMesAno(idx),
      contas,
      parcelas,
      total,
      sobra: rendaValida ? arred(rendaValida - total) : null,
    };
  });

  return { pontos, renda: rendaValida };
}
