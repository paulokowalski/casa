/**
 * Análise da Gestão Financeira: indicadores, saúde financeira, insights de economia
 * e simulação de impacto de uma nova compra. Funções puras, sem acesso à API.
 */
import type { CompraRegistro, Parcela } from '../../types/financas';
import { capitalize } from '../../utils/format';
import {
  arred,
  DIAS_SEMANA,
  idxDaData,
  lerCancelamento,
  mesIdx,
  nomeSemMarcacao,
  normalizar,
  partesData,
  rotuloMes,
  rotuloMesLongo,
  somar,
  valorParcelaDe,
  type MesRef,
} from './parcelas';

export type { Parcela, CompraRegistro };

// ---------------------------------------------------------------------------
// Projeção a partir de todas as compras
// ---------------------------------------------------------------------------

export interface Termino {
  nome: string;
  valorParcela: number;
}

interface Projecao {
  /** total lançado por mês (idx), à vista + parcelado */
  porMes: Record<number, number>;
  /** apenas parcelas de compras parceladas (n>1) por mês */
  parceladoPorMes: Record<number, number>;
  /** compras parceladas (n>1) que têm a ÚLTIMA parcela no mês idx */
  terminos: Record<number, Termino[]>;
}

function projetar(registros: CompraRegistro[]): Projecao {
  const porMes: Record<number, number> = {};
  const parceladoPorMes: Record<number, number> = {};
  const terminos: Record<number, Termino[]> = {};
  registros.forEach((r) => {
    const inicio = idxDaData(r.dataCompra);
    const n = Number(r.numeroParcelas) || 1;
    if (inicio === null) return;
    const vp = valorParcelaDe(r.valorProduto, n);
    for (let k = 1; k <= n; k++) {
      const idx = inicio + k;
      porMes[idx] = arred((porMes[idx] || 0) + vp);
      if (n > 1) parceladoPorMes[idx] = arred((parceladoPorMes[idx] || 0) + vp);
    }
    if (n > 1) {
      const fim = inicio + n;
      (terminos[fim] = terminos[fim] || []).push({ nome: nomeSemMarcacao(r.nomeProduto), valorParcela: vp });
    }
  });
  return { porMes, parceladoPorMes, terminos };
}

// ---------------------------------------------------------------------------
// Análise completa
// ---------------------------------------------------------------------------

export interface EntradaAnalise {
  ref: MesRef;
  parcelasMes: Parcela[];
  /** [0] = mês anterior, [1] = dois meses antes ... */
  parcelasAnteriores: Parcela[][];
  registros: CompraRegistro[];
  orcamento: number | null;
  hoje: Date;
}

export interface FatorSaude {
  texto: string;
  ok: boolean | null;
}

export type TipoInsight =
  'categoria' | 'recorrente' | 'pequenas' | 'fimDeSemana' | 'segurar' | 'parcelado' | 'positivo';

export interface Insight {
  id: string;
  tipo: TipoInsight;
  titulo: string;
  descricao: string;
  economia: number | null;
  destaque?: boolean;
}

export interface Analise {
  refIdx: number;
  totalMes: number;
  totalMesAnterior: number | null;
  variacaoMesAnterior: number | null;
  media6: number | null;
  parcelado: number;
  aVista: number;
  pctParcelado: number;
  comprometidoFuturo: number;
  qtdComprasComprometidas: number;
  quitadoEmIdx: number | null;
  terminamEsteMes: { qtd: number; libera: number };
  orcamento: { valor: number; usadoPct: number; restante: number; diasRestantes: number | null } | null;
  serie12: { idx: number; rotulo: string; valor: number; atual: boolean }[];
  projecao12: { idx: number; rotulo: string; valor: number; libera: number }[];
  projecaoMapa: Record<number, number>;
  terminosPorMes: Record<number, Termino[]>;
  proximasTerminar: {
    nome: string;
    parcelaAtual: number;
    total: number;
    valorParcela: number;
    fimIdx: number;
    progresso: number;
  }[];
  categorias: { nome: string; valor: number; media: number | null; delta: number | null }[];
  cartoes: { nome: string; valor: number; pct: number }[];
  diasSemana: { dia: string; valor: number }[];
  pctFimDeSemana: number;
  topGastos: { nome: string; valor: number; detalhe: string }[];
  pctTop5: number;
  recorrentes: { nome: string; valorMensal: number; meses: number }[];
  totalRecorrente: number;
  pequenas: { qtd: number; total: number };
  score: { nota: number; rotulo: 'Saudável' | 'Atenção' | 'Crítico'; fatores: FatorSaude[]; dica: string };
  insights: Insight[];
  economiaTotal: number;
}

function agrupar(parcelas: Parcela[], chave: (p: Parcela) => string): Record<string, number> {
  const mapa: Record<string, number> = {};
  parcelas.forEach((p) => {
    const k = chave(p);
    mapa[k] = arred((mapa[k] || 0) + Number(p.valorParcela || 0));
  });
  return mapa;
}

const categoriaDe = (p: Parcela) => normalizar(p.categoria) || 'SEM CATEGORIA';

function diaDaSemana(data: string): number | null {
  const p = partesData(data);
  if (!p) return null;
  const d = new Date(p.ano, p.mes - 1, p.dia).getDay(); // 0=dom
  return d === 0 ? 6 : d - 1; // 0=seg ... 6=dom
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: v >= 100 ? 0 : 2,
  }).format(v);

const pct = (v: number) => `${Math.round(v * 100)}%`;

export function calcularAnalise(e: EntradaAnalise): Analise {
  const refIdx = mesIdx(e.ref);
  const anoRef = e.ref.ano;
  const proj = projetar(e.registros);

  // --- Totais do mês --------------------------------------------------------
  const totalMes = somar(e.parcelasMes.map((p) => Number(p.valorParcela || 0)));
  const parcelado = somar(e.parcelasMes.filter((p) => p.numeroTotalParcela > 1).map((p) => p.valorParcela));
  const aVista = arred(totalMes - parcelado);
  const pctParcelado = totalMes > 0 ? parcelado / totalMes : 0;

  const anterior = e.parcelasAnteriores[0];
  const totalMesAnterior = anterior && anterior.length > 0 ? somar(anterior.map((p) => p.valorParcela)) : null;
  const variacaoMesAnterior =
    totalMesAnterior && totalMesAnterior > 0 ? (totalMes - totalMesAnterior) / totalMesAnterior : null;

  // --- Série de 12 meses (a partir de todas as compras) ----------------------
  const serie12 = [];
  for (let i = 11; i >= 0; i--) {
    const idx = refIdx - i;
    const valor = i === 0 ? totalMes : proj.porMes[idx] || 0;
    serie12.push({ idx, rotulo: rotuloMes(idx, anoRef), valor: arred(valor), atual: i === 0 });
  }
  const ultimos6 = serie12.slice(5, 11).filter((s) => s.valor > 0);
  const media6 = ultimos6.length > 0 ? arred(ultimos6.reduce((a, s) => a + s.valor, 0) / ultimos6.length) : null;

  // --- Projeção / compromissos futuros -------------------------------------
  let comprometidoFuturo = 0;
  let quitadoEmIdx: number | null = null;
  Object.keys(proj.parceladoPorMes).forEach((k) => {
    const idx = Number(k);
    if (idx > refIdx && proj.parceladoPorMes[idx] > 0) {
      comprometidoFuturo += proj.parceladoPorMes[idx];
      if (quitadoEmIdx === null || idx > quitadoEmIdx) quitadoEmIdx = idx;
    }
  });
  comprometidoFuturo = arred(comprometidoFuturo);
  const qtdComprasComprometidas = e.registros.filter((r) => {
    const ini = idxDaData(r.dataCompra);
    const n = Number(r.numeroParcelas) || 1;
    return n > 1 && ini !== null && ini + n > refIdx;
  }).length;

  const projecao12 = [];
  for (let i = 0; i < 12; i++) {
    const idx = refIdx + i;
    const valor = i === 0 ? parcelado : proj.parceladoPorMes[idx] || 0;
    const libera = somar((proj.terminos[idx - 1] || []).map((t) => t.valorParcela));
    projecao12.push({ idx, rotulo: rotuloMes(idx, anoRef), valor: arred(valor), libera: i === 0 ? 0 : libera });
  }

  const terminandoAgora = e.parcelasMes.filter(
    (p) => p.numeroTotalParcela > 1 && p.numeroParcela === p.numeroTotalParcela,
  );
  const terminamEsteMes = { qtd: terminandoAgora.length, libera: somar(terminandoAgora.map((p) => p.valorParcela)) };

  const proximasTerminar = e.registros
    .filter((r) => (Number(r.numeroParcelas) || 1) > 1)
    .map((r) => {
      const ini = idxDaData(r.dataCompra) as number;
      const total = Number(r.numeroParcelas);
      const fimIdx = ini + total;
      const parcelaAtual = Math.max(0, Math.min(total, refIdx - ini));
      return {
        nome: nomeSemMarcacao(r.nomeProduto),
        parcelaAtual,
        total,
        valorParcela: valorParcelaDe(r.valorProduto, total),
        fimIdx,
        progresso: total > 0 ? parcelaAtual / total : 0,
      };
    })
    .filter((x) => x.fimIdx >= refIdx && x.parcelaAtual >= 1)
    .sort((a, b) => a.fimIdx - b.fimIdx || b.valorParcela - a.valorParcela)
    .slice(0, 6);

  // --- Orçamento ------------------------------------------------------------
  let orcamento: Analise['orcamento'] = null;
  if (e.orcamento && e.orcamento > 0) {
    const hojeIdx = e.hoje.getFullYear() * 12 + e.hoje.getMonth();
    let diasRestantes: number | null = null;
    if (hojeIdx === refIdx) {
      const ultimoDia = new Date(e.ref.ano, e.ref.mes, 0).getDate();
      diasRestantes = ultimoDia - e.hoje.getDate();
    }
    orcamento = {
      valor: e.orcamento,
      usadoPct: totalMes / e.orcamento,
      restante: arred(e.orcamento - totalMes),
      diasRestantes,
    };
  }

  // --- Categorias -----------------------------------------------------------
  const catAtual = agrupar(e.parcelasMes, categoriaDe);
  const mesesComDados = e.parcelasAnteriores.filter((l) => l && l.length > 0);
  const catAnteriores = mesesComDados.map((l) => agrupar(l, categoriaDe));
  const categorias = Object.keys(catAtual)
    .map((nome) => {
      const valor = catAtual[nome];
      let media: number | null = null;
      if (catAnteriores.length > 0) {
        media = arred(catAnteriores.reduce((a, m) => a + (m[nome] || 0), 0) / catAnteriores.length);
      }
      const delta = media && media > 0 ? (valor - media) / media : null;
      return { nome, valor, media, delta };
    })
    .sort((a, b) => b.valor - a.valor);

  // --- Cartões ----------------------------------------------------------------
  const porCartao = agrupar(e.parcelasMes, (p) => normalizar(p.nomeCartao) || 'SEM CARTÃO');
  const cartoes = Object.keys(porCartao)
    .map((nome) => ({ nome, valor: porCartao[nome], pct: totalMes > 0 ? porCartao[nome] / totalMes : 0 }))
    .sort((a, b) => b.valor - a.valor);

  // --- Dia da semana (compras à vista, pela data da compra) ----------------
  const dias = [0, 0, 0, 0, 0, 0, 0];
  e.parcelasMes
    .filter((p) => p.numeroTotalParcela === 1 && p.valorParcela > 0)
    .forEach((p) => {
      const d = diaDaSemana(p.dataCompra);
      if (d !== null) dias[d] = arred(dias[d] + p.valorParcela);
    });
  const totalDias = dias.reduce((a, b) => a + b, 0);
  const fimDeSemana = dias[4] + dias[5] + dias[6];
  const pctFimDeSemana = totalDias > 0 ? fimDeSemana / totalDias : 0;
  const diasSemana = dias.map((valor, i) => ({ dia: DIAS_SEMANA[i], valor }));

  // --- Maiores gastos -------------------------------------------------------
  const ordenadas = e.parcelasMes.slice().sort((a, b) => b.valorParcela - a.valorParcela);
  const topGastos = ordenadas.slice(0, 5).map((p) => ({
    nome: nomeSemMarcacao(p.nomeCompra),
    valor: p.valorParcela,
    detalhe: p.numeroTotalParcela > 1 ? `${p.numeroParcela}/${p.numeroTotalParcela}` : normalizar(p.nomeCartao),
  }));
  const pctTop5 = totalMes > 0 ? somar(topGastos.map((t) => t.valor)) / totalMes : 0;

  // --- Recorrentes (assinaturas) -------------------------------------------
  const janelaIni = refIdx - 7;
  const grupos: Record<
    string,
    { meses: Record<number, number>; repetidoNoMes: boolean; ultimoIdx: number; ultimoValor: number; nome: string }
  > = {};
  e.registros
    .filter(
      (r) => (Number(r.numeroParcelas) || 1) === 1 && Number(r.valorProduto) > 0 && !lerCancelamento(r.nomeProduto),
    )
    .forEach((r) => {
      const idx = idxDaData(r.dataCompra);
      if (idx === null || idx < janelaIni || idx > refIdx) return;
      const chave = normalizar(r.nomeProduto);
      const g = (grupos[chave] = grupos[chave] || {
        meses: {},
        repetidoNoMes: false,
        ultimoIdx: -1,
        ultimoValor: 0,
        nome: chave,
      });
      if (g.meses[idx] !== undefined) g.repetidoNoMes = true;
      g.meses[idx] = Number(r.valorProduto);
      if (idx >= g.ultimoIdx) {
        g.ultimoIdx = idx;
        g.ultimoValor = Number(r.valorProduto);
      }
    });
  const recorrentes = Object.keys(grupos)
    .map((k) => grupos[k])
    .filter((g) => {
      const valores = Object.keys(g.meses).map((k) => g.meses[Number(k)]);
      // assinatura = 1 cobrança por mês, valor praticamente fixo, em 3+ meses
      if (valores.length < 3 || g.repetidoNoMes) return false;
      if (g.ultimoIdx < refIdx - 2) return false; // não aparece mais
      const min = Math.min.apply(null, valores);
      const max = Math.max.apply(null, valores);
      return max > 0 && min / max >= 0.9;
    })
    .map((g) => ({ nome: g.nome, valorMensal: g.ultimoValor, meses: Object.keys(g.meses).length }))
    .sort((a, b) => b.valorMensal - a.valorMensal);
  const totalRecorrente = somar(recorrentes.map((r) => r.valorMensal));

  // --- Pequenas compras -----------------------------------------------------
  const pequenasLista = e.parcelasMes.filter(
    (p) => p.numeroTotalParcela === 1 && p.valorParcela > 0 && p.valorParcela < 50,
  );
  const pequenas = { qtd: pequenasLista.length, total: somar(pequenasLista.map((p) => p.valorParcela)) };

  // --- Saúde financeira -----------------------------------------------------
  const penalidades: { motivo: string; valor: number }[] = [];
  const fatores: FatorSaude[] = [];

  if (orcamento) {
    const u = orcamento.usadoPct;
    fatores.push({
      texto: u <= 1 ? `Dentro do orçamento (${pct(u)})` : `Orçamento estourado (${pct(u)})`,
      ok: u <= 0.9 ? true : u <= 1 ? null : false,
    });
    if (u > 1) penalidades.push({ motivo: 'orcamento', valor: 25 });
    else if (u > 0.9) penalidades.push({ motivo: 'orcamento', valor: 10 });
  } else {
    fatores.push({ texto: 'Defina um orçamento mensal para uma nota mais precisa', ok: null });
  }

  fatores.push({
    texto: `Parcelado = ${pct(pctParcelado)} do mês (ideal < 30%)`,
    ok: pctParcelado <= 0.3,
  });
  if (pctParcelado > 0.3)
    penalidades.push({ motivo: 'parcelado', valor: Math.min(25, (pctParcelado * 100 - 30) * 0.8) });

  if (media6) {
    const r = totalMes / media6;
    fatores.push({
      texto: r <= 1 ? `Abaixo da média de 6 meses` : `${pct(r - 1)} acima da média de 6 meses`,
      ok: r <= 1.05,
    });
    if (r > 1.1) penalidades.push({ motivo: 'media', valor: 10 });
    else if (r > 1.05) penalidades.push({ motivo: 'media', valor: 5 });
  }

  const s = serie12.map((x) => x.valor);
  const tendenciaAlta = s[11] > s[10] && s[10] > s[9] && s[9] > 0;
  fatores.push({
    texto: tendenciaAlta ? 'Gastos subindo há 3 meses seguidos' : 'Sem tendência de alta contínua',
    ok: !tendenciaAlta,
  });
  if (tendenciaAlta) penalidades.push({ motivo: 'tendencia', valor: 10 });

  const longas = e.registros.filter((r) => {
    const ini = idxDaData(r.dataCompra);
    const n = Number(r.numeroParcelas) || 1;
    return n > 12 && ini !== null && ini + n > refIdx;
  }).length;
  fatores.push({
    texto: longas === 0 ? 'Nenhuma compra ativa acima de 12x' : `${longas} compra(s) ativa(s) acima de 12x`,
    ok: longas === 0,
  });
  if (longas > 0) penalidades.push({ motivo: 'longas', valor: Math.min(10, longas * 5) });

  const totalPenalidade = penalidades.reduce((a, p) => a + p.valor, 0);
  const nota = Math.max(0, Math.min(100, Math.round(100 - totalPenalidade)));
  const rotulo: Analise['score']['rotulo'] = nota >= 80 ? 'Saudável' : nota >= 60 ? 'Atenção' : 'Crítico';
  const pior = penalidades.slice().sort((a, b) => b.valor - a.valor)[0];
  let dica = 'Continue assim! Seus gastos estão equilibrados neste mês.';
  if (pior) {
    switch (pior.motivo) {
      case 'orcamento':
        dica =
          orcamento && orcamento.restante < 0
            ? `Corte ${fmt(-orcamento.restante)} nos próximos meses para voltar ao orçamento.`
            : 'Você está perto do limite do orçamento: segure gastos não essenciais até o fim do mês.';
        break;
      case 'parcelado':
        dica = `Reduza o parcelado para menos de ${fmt(totalMes * 0.3)}/mês evitando novos parcelamentos até algumas parcelas terminarem.`;
        break;
      case 'media':
        dica = `Tente voltar para perto da sua média (${fmt(media6 || 0)}) no próximo mês.`;
        break;
      case 'tendencia':
        dica = 'Seus gastos sobem há 3 meses. Escolha uma categoria para congelar no próximo mês.';
        break;
      case 'longas':
        dica = 'Evite parcelamentos acima de 12x: eles prendem o orçamento por muito tempo.';
        break;
    }
  }

  // --- Insights -------------------------------------------------------------
  const insights: Insight[] = [];

  categorias
    .filter((c) => c.media !== null && c.delta !== null && c.delta > 0.15 && c.valor - (c.media as number) >= 50)
    .sort((a, b) => b.valor - (b.media as number) - (a.valor - (a.media as number)))
    .slice(0, 2)
    .forEach((c) => {
      const media = c.media as number;
      insights.push({
        id: `cat-${c.nome}`,
        tipo: 'categoria',
        titulo: `${capitalize(c.nome)} subiu ${pct(c.delta as number)}`,
        descricao: `${fmt(c.valor)} este mês contra média de ${fmt(media)} nos meses anteriores. Voltar à média já economiza.`,
        economia: arred(c.valor - media),
      });
    });

  if (recorrentes.length > 0) {
    const nomes = recorrentes
      .slice(0, 3)
      .map((r) => capitalize(r.nome))
      .join(', ');
    insights.push({
      id: 'recorrentes',
      tipo: 'recorrente',
      titulo: `${recorrentes.length} cobrança${recorrentes.length > 1 ? 's' : ''} recorrente${recorrentes.length > 1 ? 's' : ''}`,
      descricao: `Somam ${fmt(totalRecorrente)}/mês (${fmt(totalRecorrente * 12)}/ano): ${nomes}${recorrentes.length > 3 ? '…' : ''}. Cancelar 1/3 delas economiza cerca de ${fmt(totalRecorrente / 3)}.`,
      economia: arred(totalRecorrente / 3),
    });
  }

  if (pequenas.qtd >= 5) {
    insights.push({
      id: 'pequenas',
      tipo: 'pequenas',
      titulo: 'Efeito cafezinho',
      descricao: `${pequenas.qtd} compras abaixo de R$ 50 somam ${fmt(pequenas.total)}. Cortar metade delas faz diferença no fim do ano.`,
      economia: arred(pequenas.total / 2),
    });
  }

  if (pctFimDeSemana >= 0.4 && fimDeSemana >= 100) {
    insights.push({
      id: 'fds',
      tipo: 'fimDeSemana',
      titulo: `Fim de semana pesa ${pct(pctFimDeSemana)}`,
      descricao: `Compras de sexta a domingo somam ${fmt(fimDeSemana)}. Planejar o lazer com um teto semanal reduz ~15%.`,
      economia: arred(fimDeSemana * 0.15),
    });
  }

  // Melhor mês para voltar a parcelar (maior liberação nos próximos 6 meses)
  let melhor: { idx: number; libera: number } | null = null;
  for (let i = 1; i <= 6; i++) {
    const p = projecao12[i];
    if (p && p.libera >= 100 && (!melhor || p.libera > melhor.libera)) melhor = { idx: p.idx, libera: p.libera };
  }
  if (melhor && pctParcelado > 0.2) {
    const nomes = (proj.terminos[melhor.idx - 1] || [])
      .slice(0, 3)
      .map((t) => t.nome)
      .join(' e ');
    insights.push({
      id: 'segurar',
      tipo: 'segurar',
      titulo: `Segure novos parcelamentos até ${rotuloMesLongo(melhor.idx)}`,
      descricao: `Nesse mês ${nomes ? `terminam ${nomes}, ` : ''}liberando ${fmt(melhor.libera)}/mês. Parcelar antes disso aumenta o comprometimento do orçamento.`,
      economia: null,
      destaque: true,
    });
  } else if (pctParcelado > 0.4) {
    insights.push({
      id: 'parcelado',
      tipo: 'parcelado',
      titulo: `Parcelas consomem ${pct(pctParcelado)} do mês`,
      descricao: `${fmt(comprometidoFuturo)} já estão comprometidos nos próximos meses. Evite novas compras parceladas até reduzir esse valor.`,
      economia: null,
      destaque: true,
    });
  }

  insights.sort((a, b) => {
    if (a.economia === null && b.economia === null) return 0;
    if (a.economia === null) return 1;
    if (b.economia === null) return -1;
    return b.economia - a.economia;
  });

  if (insights.length === 0 && totalMes > 0) {
    insights.push({
      id: 'ok',
      tipo: 'positivo',
      titulo: 'Nada fora do padrão',
      descricao:
        'Nenhuma categoria subiu muito, não há cobranças recorrentes relevantes e o parcelado está controlado.',
      economia: null,
    });
  }

  const economiaTotal = arred(insights.reduce((a, i) => a + (i.economia || 0), 0));

  return {
    refIdx,
    totalMes,
    totalMesAnterior,
    variacaoMesAnterior,
    media6,
    parcelado,
    aVista,
    pctParcelado,
    comprometidoFuturo,
    qtdComprasComprometidas,
    quitadoEmIdx,
    terminamEsteMes,
    orcamento,
    serie12,
    projecao12,
    projecaoMapa: proj.parceladoPorMes,
    terminosPorMes: proj.terminos,
    proximasTerminar,
    categorias,
    cartoes,
    diasSemana,
    pctFimDeSemana,
    topGastos,
    pctTop5,
    recorrentes,
    totalRecorrente,
    pequenas,
    score: { nota, rotulo, fatores, dica },
    insights,
    economiaTotal,
  };
}

// ---------------------------------------------------------------------------
// Simulação de impacto de uma nova compra
// ---------------------------------------------------------------------------

export interface Simulacao {
  valorParcela: number;
  primeiraIdx: number;
  ultimaIdx: number;
  comprometidoAntes: number;
  comprometidoDepois: number;
  pctOrcamentoAntes: number | null;
  pctOrcamentoDepois: number | null;
  sugestao: { compraIdx: number; nomes: string[] } | null;
}

export function simularCompra(
  analise: Analise,
  valor: number,
  numeroParcelas: number,
  dataCompra: string,
  orcamento: number | null,
): Simulacao | null {
  const ini = idxDaData(dataCompra);
  if (ini === null || !valor || valor <= 0) return null;
  const n = Math.max(1, numeroParcelas || 1);
  const vp = valorParcelaDe(valor, n);
  const primeiraIdx = ini + 1;
  const ultimaIdx = ini + n;
  const antes = analise.projecaoMapa[primeiraIdx] || 0;
  const depois = arred(antes + vp);
  const orc = orcamento && orcamento > 0 ? orcamento : null;

  let sugestao: Simulacao['sugestao'] = null;
  if (n > 1) {
    // primeiro mês futuro em que as parcelas que terminam liberam espaço >= nova parcela
    for (let m = primeiraIdx + 1; m <= primeiraIdx + 12; m++) {
      const comprometidoEm = analise.projecaoMapa[m] || 0;
      if (comprometidoEm + vp <= antes) {
        const nomes: string[] = [];
        for (let j = primeiraIdx; j < m; j++) {
          (analise.terminosPorMes[j] || []).forEach((t) => {
            if (nomes.indexOf(t.nome) < 0) nomes.push(t.nome);
          });
        }
        sugestao = { compraIdx: m - 1, nomes: nomes.slice(0, 3) };
        break;
      }
    }
  }

  return {
    valorParcela: vp,
    primeiraIdx,
    ultimaIdx,
    comprometidoAntes: arred(antes),
    comprometidoDepois: depois,
    pctOrcamentoAntes: orc ? antes / orc : null,
    pctOrcamentoDepois: orc ? depois / orc : null,
    sugestao,
  };
}
