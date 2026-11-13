import type { Parcela } from '../../types/financas';
import { arred, nomeSemMarcacao, rotuloMesAno, somar } from './parcelas';

export interface MesFuturo {
  idx: number;
  parcelas: Parcela[];
}

export interface PontoProximo {
  idx: number;
  rotulo: string;
  total: number;
  livre: number;
}

export interface TerminoFuturo {
  idx: number;
  nome: string;
  cartao: string;
  parcela: string;
  libera: number;
}

export interface ProximosMeses {
  pontos: PontoProximo[];
  comprometido: number;
  media: number;
  qtdCompras: number;
  maisPesado: { idx: number; total: number } | null;
  livreDeParcelasIdx: number | null;
  continuaDepois: boolean;
  terminam: TerminoFuturo[];
  orcamento: number | null;
}

export function calcularProximosMeses(meses: MesFuturo[], orcamento: number | null): ProximosMeses {
  const ordenados = [...meses].sort((a, b) => a.idx - b.idx);

  const pontos: PontoProximo[] = ordenados.map((m) => {
    const total = arred(somar(m.parcelas.map((p) => Number(p.valorParcela) || 0)));
    return {
      idx: m.idx,
      rotulo: rotuloMesAno(m.idx),
      total,
      livre: orcamento ? Math.max(0, arred(orcamento - total)) : 0,
    };
  });

  const comprometido = arred(somar(pontos.map((p) => p.total)));
  const comParcelas = pontos.filter((p) => p.total > 0);
  const maisPesado = comParcelas.length ? comParcelas.reduce((a, b) => (b.total > a.total ? b : a)) : null;
  const ultimoComParcelas = comParcelas.at(-1) ?? null;
  const ultimoDaJanela = pontos.at(-1);
  const continuaDepois = Boolean(ultimoComParcelas && ultimoDaJanela && ultimoComParcelas.idx === ultimoDaJanela.idx);

  const compras = new Set<string>();
  const terminam: TerminoFuturo[] = [];
  ordenados.forEach((m) =>
    m.parcelas.forEach((p) => {
      compras.add(`${p.nomeCompra}|${p.dataCompra}|${p.numeroTotalParcela}|${p.valorTotal}`);
      if (p.numeroTotalParcela > 1 && p.numeroParcela === p.numeroTotalParcela) {
        terminam.push({
          idx: m.idx,
          nome: nomeSemMarcacao(p.nomeCompra),
          cartao: p.nomeCartao,
          parcela: `${p.numeroParcela} de ${p.numeroTotalParcela}`,
          libera: Number(p.valorParcela) || 0,
        });
      }
    }),
  );
  terminam.sort((a, b) => a.idx - b.idx || b.libera - a.libera);

  return {
    pontos,
    comprometido,
    media: pontos.length ? arred(comprometido / pontos.length) : 0,
    qtdCompras: compras.size,
    maisPesado: maisPesado ? { idx: maisPesado.idx, total: maisPesado.total } : null,
    livreDeParcelasIdx: ultimoComParcelas ? ultimoComParcelas.idx + 1 : null,
    continuaDepois,
    terminam,
    orcamento: orcamento && orcamento > 0 ? orcamento : null,
  };
}
