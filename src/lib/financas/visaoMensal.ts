/**
 * Visão consolidada do mês (contas fora do cartão + cartão de crédito) e insights de economia
 * da Gestão Financeira. Funções puras: recebem os dados já carregados e devolvem números e textos.
 */
import type { Conta, Lancamento, TipoConta } from '../../types/contas';
import type { Parcela } from '../../types/financas';
import type { Tone } from '../../styles/tokens';
import { formatCurrency, formatPercent } from '../../utils/format';
import { mesIdx, rotuloMes, rotuloMesLongo, type MesRef } from './parcelas';

// ---------------------------------------------------------------------------- tipos

export interface Grupo {
  nome: string;
  valor: number;
  itens: string[];
  cartao?: boolean;
}

export interface FaixaRegra {
  nome: string;
  descricao: string;
  valor: number;
  /** fração da renda */
  pct: number;
  /** meta (fração) */
  meta: number;
  /** essenciais e estilo de vida: abaixo da meta é bom; reserva: acima é bom */
  acimaEhBom: boolean;
}

export interface PontoSerie {
  idx: number;
  rotulo: string;
  contas: number;
  cartao: number;
  total: number;
}

export interface Financiamento {
  contaId: string;
  descricao: string;
  valor: number;
  parcela: number;
  total: number;
  restantes: number;
  saldo: number;
  fimIdx: number;
  jurosMes: number | null;
}

export interface Insight {
  id: string;
  tone: Tone;
  titulo: string;
  texto: string;
  tag: string;
  /** economia mensal estimada (entra no total "Economia possível") */
  economiaMensal?: number;
}

export type SituacaoConta = 'paga' | 'atrasada' | 'hoje' | 'breve' | 'pendente';

/** Linha da lista "Contas do mês": uma conta ou a fatura do cartão */
export interface LinhaConta {
  chave: string;
  lancamento: Lancamento | null;
  descricao: string;
  detalhe: string;
  categoria: string;
  tipo: TipoConta | 'CARTAO';
  vencimento: string | null;
  valor: number;
  situacao: SituacaoConta | 'cartao';
  /** conta ou fatura marcada como paga */
  paga: boolean;
  diasParaVencer: number | null;
}

export interface VisaoMensal {
  ref: MesRef;
  refIdx: number;
  totalMes: number;
  contasMes: number;
  qtdContas: number;
  cartaoMes: number;
  qtdCartao: number;
  cartoes: string[];
  variacaoTotal: number | null;
  mediaCartao6: number | null;
  renda: number | null;
  sobra: number | null;
  sobraPct: number | null;
  aPagar: number;
  qtdAPagar: number;
  proximoVencimento: string | null;
  grupos: Grupo[];
  regra: FaixaRegra[] | null;
  serie: PontoSerie[];
  financiamentos: Financiamento[];
  insights: Insight[];
  economiaPossivel: number;
  linhas: LinhaConta[];
}

export interface EntradaVisao {
  ref: MesRef;
  /** contas dos 12 meses até `ref` */
  lancamentos: Lancamento[];
  contas: Conta[];
  /** parcelas do cartão no mês `ref` */
  parcelasCartao: Parcela[];
  /** total do cartão por mês (índice de mês → valor) */
  cartaoPorMes: Map<number, number>;
  renda: number | null;
  /** fatura do cartão do mês marcada como paga */
  faturaPaga: boolean;
  hoje: Date;
}

// ------------------------------------------------------------------------ helpers

const soma = (xs: number[]) => xs.reduce((a, x) => a + x, 0);
const idxDeCompetencia = (c: string) => {
  const [ano, mes] = c.split('-').map(Number);
  return mesIdx({ ano, mes });
};
const diaDe = (iso: string) => Number(iso.slice(8, 10));

function hojeISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function diasEntre(deISO: string, ateISO: string) {
  const [a, b] = [deISO, ateISO].map((s) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)));
  return Math.round((b - a) / 86_400_000);
}

export function situacaoDe(l: Lancamento, hoje: string): { situacao: SituacaoConta; dias: number } {
  const dias = diasEntre(hoje, l.vencimento);
  if (l.paga) return { situacao: 'paga', dias };
  if (dias < 0) return { situacao: 'atrasada', dias };
  if (dias === 0) return { situacao: 'hoje', dias };
  if (dias <= 7) return { situacao: 'breve', dias };
  return { situacao: 'pendente', dias };
}

export function detalheLancamento(l: Lancamento): string {
  const partes: string[] = [];
  if (l.tipo === 'PARCELADA' && l.numeroParcela) {
    partes.push(
      l.numeroParcela === l.totalParcelas
        ? `Parcela ${l.numeroParcela} de ${l.totalParcelas} · última`
        : `Parcela ${l.numeroParcela} de ${l.totalParcelas}`,
    );
  } else if (l.tipo === 'RECORRENTE') {
    partes.push('Todo mês');
  } else {
    partes.push('Só neste mês');
  }
  if (l.valorEstimado) partes.push('valor estimado: confirme quando a conta chegar');
  else if (l.debitoAutomatico) partes.push('débito automático');
  return partes.join(' · ');
}

// ----------------------------------------------------------------------- cálculo

export function calcularVisao(e: EntradaVisao): VisaoMensal {
  const refIdx = mesIdx(e.ref);
  const hoje = hojeISO(e.hoje);
  const porMes = new Map<number, Lancamento[]>();
  e.lancamentos.forEach((l) => {
    const i = idxDeCompetencia(l.competencia);
    porMes.set(i, [...(porMes.get(i) ?? []), l]);
  });
  const doMes = porMes.get(refIdx) ?? [];

  // Cartão do mês: soma exata das parcelas (o histórico vem do total mensal)
  const cartaoMes = soma(e.parcelasCartao.map((p) => Number(p.valorParcela) || 0));
  const cartaoDe = (i: number) => (i === refIdx ? cartaoMes : (e.cartaoPorMes.get(i) ?? 0));
  const contasDe = (i: number) => soma((porMes.get(i) ?? []).map((l) => l.valor));
  const cartoes = [...new Set(e.parcelasCartao.map((p) => p.nomeCartao).filter(Boolean))];

  const contasMes = contasDe(refIdx);
  const totalMes = contasMes + cartaoMes;
  const totalAnterior = contasDe(refIdx - 1) + cartaoDe(refIdx - 1);
  const variacaoTotal = totalAnterior > 0 ? totalMes / totalAnterior - 1 : null;

  const anterioresCartao = [1, 2, 3, 4, 5, 6].map((k) => cartaoDe(refIdx - k)).filter((v) => v > 0);
  const mediaCartao6 = anterioresCartao.length >= 3 ? soma(anterioresCartao) / anterioresCartao.length : null;

  const renda = e.renda && e.renda > 0 ? e.renda : null;
  const sobra = renda !== null ? renda - totalMes : null;
  const sobraPct = renda !== null && sobra !== null ? sobra / renda : null;

  const pendentes = doMes.filter((l) => !l.paga);
  const faturaAPagar = cartaoMes > 0 && !e.faturaPaga;
  const aPagar = soma(pendentes.map((l) => l.valor)) + (faturaAPagar ? cartaoMes : 0);
  const proximo = pendentes
    .map((l) => l.vencimento)
    .filter((v) => v >= hoje)
    .sort()[0];

  // Para onde vai o dinheiro
  const mapaGrupos = new Map<string, Grupo>();
  doMes.forEach((l) => {
    const nome = l.categoria || 'Outros';
    const g = mapaGrupos.get(nome) ?? { nome, valor: 0, itens: [] };
    g.valor += l.valor;
    g.itens.push(l.descricao);
    mapaGrupos.set(nome, g);
  });
  const grupos = [...mapaGrupos.values()];
  if (cartaoMes > 0) grupos.push({ nome: 'Cartão de crédito', valor: cartaoMes, itens: cartoes, cartao: true });
  grupos.sort((a, b) => b.valor - a.valor);

  const regra: FaixaRegra[] | null = renda
    ? [
        {
          nome: 'Essenciais',
          descricao: 'contas fixas',
          valor: contasMes,
          pct: contasMes / renda,
          meta: 0.5,
          acimaEhBom: false,
        },
        {
          nome: 'Estilo de vida',
          descricao: 'cartão de crédito',
          valor: cartaoMes,
          pct: cartaoMes / renda,
          meta: 0.3,
          acimaEhBom: false,
        },
        {
          nome: 'Sobra / reserva',
          descricao: 'o que fica',
          valor: Math.max(0, sobra ?? 0),
          pct: Math.max(0, sobraPct ?? 0),
          meta: 0.2,
          acimaEhBom: true,
        },
      ]
    : null;

  const serie: PontoSerie[] = Array.from({ length: 12 }, (_, k) => {
    const idx = refIdx - 11 + k;
    const contas = contasDe(idx);
    const cartao = cartaoDe(idx);
    return { idx, rotulo: rotuloMes(idx, e.ref.ano), contas, cartao, total: contas + cartao };
  });

  const financiamentos = calcularFinanciamentos(e.contas, doMes, refIdx);

  const linhas: LinhaConta[] = doMes.map((l) => {
    const s = situacaoDe(l, hoje);
    return {
      chave: l.id,
      lancamento: l,
      descricao: l.descricao,
      detalhe: detalheLancamento(l),
      categoria: l.categoria || 'Outros',
      tipo: l.tipo,
      vencimento: l.vencimento,
      valor: l.valor,
      situacao: s.situacao,
      paga: l.paga,
      diasParaVencer: s.dias,
    };
  });
  if (cartaoMes > 0) {
    linhas.unshift({
      chave: 'cartao',
      lancamento: null,
      descricao: 'Fatura do cartão',
      detalhe: `${cartoes.join(', ') || 'Cartões'} · ${e.parcelasCartao.length} lançamento${e.parcelasCartao.length === 1 ? '' : 's'}`,
      categoria: 'Cartão',
      tipo: 'CARTAO',
      vencimento: null,
      valor: cartaoMes,
      situacao: e.faturaPaga ? 'paga' : 'cartao',
      paga: e.faturaPaga,
      diasParaVencer: null,
    });
  }

  const base = {
    ref: e.ref,
    refIdx,
    totalMes,
    contasMes,
    qtdContas: doMes.length,
    cartaoMes,
    qtdCartao: e.parcelasCartao.length,
    cartoes,
    variacaoTotal,
    mediaCartao6,
    renda,
    sobra,
    sobraPct,
    aPagar,
    qtdAPagar: pendentes.length + (faturaAPagar ? 1 : 0),
    proximoVencimento: proximo ?? null,
    grupos,
    regra,
    serie,
    financiamentos,
    linhas,
  };
  const insights = gerarInsights(base, porMes, doMes);
  return {
    ...base,
    insights,
    economiaPossivel: soma(insights.map((i) => i.economiaMensal ?? 0)),
  };
}

function calcularFinanciamentos(contas: Conta[], doMes: Lancamento[], refIdx: number): Financiamento[] {
  return contas
    .filter((c) => c.tipo === 'PARCELADA' && c.totalParcelas && c.parcelaInicial && c.competenciaFim)
    .map((c) => {
      const inicioIdx = idxDeCompetencia(c.competenciaInicio);
      const fimIdx = idxDeCompetencia(c.competenciaFim as string);
      const noMes = doMes.find((l) => l.contaId === c.id);
      const parcela = noMes?.numeroParcela ?? (c.parcelaInicial as number) + (refIdx - inicioIdx);
      const total = c.totalParcelas as number;
      const restantes = Math.max(0, total - parcela);
      return {
        contaId: c.id,
        descricao: c.descricao,
        valor: c.valor,
        parcela,
        total,
        restantes,
        saldo: restantes * c.valor,
        fimIdx,
        jurosMes: c.jurosMes,
      };
    })
    .filter((f) => f.parcela >= 1 && f.parcela <= f.total) // em andamento no mês
    .sort((a, b) => b.saldo - a.saldo);
}

// ---------------------------------------------------------------------- insights

type Base = Omit<VisaoMensal, 'insights' | 'economiaPossivel'>;

function gerarInsights(v: Base, porMes: Map<number, Lancamento[]>, doMes: Lancamento[]): Insight[] {
  const lista: Insight[] = [];
  const mesNome = (idx: number) => rotuloMesLongo(idx).toLowerCase();

  // 1. Cartão acima da média
  if (v.mediaCartao6 && v.cartaoMes > v.mediaCartao6 * 1.1) {
    const excesso = v.cartaoMes - v.mediaCartao6;
    lista.push({
      id: 'cartao-media',
      tone: 'error',
      titulo: `Cartão ${formatPercent(v.cartaoMes / v.mediaCartao6 - 1)} acima da sua média`,
      texto: `${formatCurrency(v.cartaoMes, true)} neste mês contra média de ${formatCurrency(v.mediaCartao6, true)} nos 6 meses anteriores. Voltar à média libera cerca de ${formatCurrency(excesso, true)}.`,
      tag: 'Atenção',
      economiaMensal: excesso,
    });
  }

  // 2. Sobra baixa (ou renda não informada)
  if (v.renda === null) {
    lista.push({
      id: 'renda',
      tone: 'info',
      titulo: 'Informe sua renda líquida',
      texto: 'Com a renda, a tela mostra quanto sobra no mês e se o orçamento está equilibrado na regra 50/30/20.',
      tag: 'Dica',
    });
  } else if (v.sobraPct !== null && v.sobraPct < 0.2) {
    lista.push({
      id: 'sobra',
      tone: v.sobraPct < 0.1 ? 'error' : 'warning',
      titulo:
        v.sobraPct < 0
          ? `Gastos passaram a renda em ${formatCurrency(-(v.sobra ?? 0), true)}`
          : `Sobra de ${formatPercent(v.sobraPct)} da renda`,
      texto: `A meta é guardar pelo menos 20% (${formatCurrency(v.renda * 0.2, true)}). Faltam ${formatCurrency(v.renda * 0.2 - (v.sobra ?? 0), true)} para chegar lá.`,
      tag: 'Meta 20%',
    });
  }

  // 3. Reajustes de contas fixas (não variáveis) nos últimos 12 meses
  const porConta = new Map<string, Lancamento[]>();
  [...porMes.values()].flat().forEach((l) => porConta.set(l.contaId, [...(porConta.get(l.contaId) ?? []), l]));
  porConta.forEach((ls) => {
    if (ls[0].valorVariavel || ls[0].tipo === 'UNICA') return;
    const ord = [...ls].sort((a, b) => a.competencia.localeCompare(b.competencia));
    for (let i = ord.length - 1; i > 0; i--) {
      const ant = ord[i - 1];
      const cur = ord[i];
      if (idxDeCompetencia(cur.competencia) > v.refIdx) continue;
      if (cur.valor > ant.valor * 1.03) {
        lista.push({
          id: `reajuste-${cur.contaId}`,
          tone: 'warning',
          titulo: `${cur.descricao} subiu ${formatPercent(cur.valor / ant.valor - 1)} em ${mesNome(idxDeCompetencia(cur.competencia))}`,
          texto: `Passou de ${formatCurrency(ant.valor)} para ${formatCurrency(cur.valor)}. Vale comparar com outras opções antes do próximo reajuste.`,
          tag: 'Revisar',
        });
        break;
      }
    }
  });

  // 4. Parcelamentos que terminam neste mês
  const terminam = doMes.filter(
    (l) => l.tipo === 'PARCELADA' && l.numeroParcela && l.numeroParcela === l.totalParcelas,
  );
  if (terminam.length > 0) {
    const libera = soma(terminam.map((l) => l.valor));
    lista.push({
      id: 'terminam',
      tone: 'success',
      titulo:
        terminam.length === 1
          ? `${terminam[0].descricao} termina este mês`
          : `${terminam.length} parcelamentos terminam este mês`,
      texto: `A partir de ${mesNome(v.refIdx + 1)} sobram ${formatCurrency(libera, true)}/mês. Programe essa quantia direto para a reserva antes que ela vire gasto.`,
      tag: `+${formatCurrency(libera, true)}/mês`,
    });
  }

  // 5. Contas de valor variável subindo 3 meses seguidos
  porConta.forEach((ls) => {
    if (!ls[0].valorVariavel) return;
    const reais = ls
      .filter((l) => !l.valorEstimado && idxDeCompetencia(l.competencia) <= v.refIdx)
      .sort((a, b) => a.competencia.localeCompare(b.competencia))
      .slice(-3);
    if (reais.length < 3) return;
    const [a, b, c] = reais;
    if (a.valor < b.valor && b.valor < c.valor && c.valor >= a.valor * 1.1) {
      const diff = c.valor - a.valor;
      lista.push({
        id: `subindo-${c.contaId}`,
        tone: 'info',
        titulo: `${c.descricao} subiu 3 meses seguidos`,
        texto: `De ${formatCurrency(a.valor)} em ${rotuloMes(idxDeCompetencia(a.competencia), v.ref.ano)} para ${formatCurrency(c.valor)} em ${rotuloMes(idxDeCompetencia(c.competencia), v.ref.ano)} (+${formatPercent(c.valor / a.valor - 1)}). Vale procurar a causa; voltar ao valor anterior economiza ${formatCurrency(diff)}/mês.`,
        tag: `−${formatCurrency(diff, true)}/mês`,
        economiaMensal: diff,
      });
    }
  });

  // 6. Vencimentos concentrados (janela de 6 dias com mais da metade das contas a pagar)
  const pendentes = doMes.filter((l) => !l.paga);
  if (pendentes.length >= 2 && v.contasMes > 0) {
    let melhor = { de: 0, valor: 0, qtd: 0 };
    for (let d = 1; d <= 26; d++) {
      const janela = pendentes.filter((l) => diaDe(l.vencimento) >= d && diaDe(l.vencimento) <= d + 5);
      const valor = soma(janela.map((l) => l.valor));
      if (valor > melhor.valor) melhor = { de: d, valor, qtd: janela.length };
    }
    if (melhor.qtd >= 2 && melhor.valor >= v.contasMes * 0.5) {
      const dias = pendentes.map((l) => diaDe(l.vencimento)).filter((d) => d >= melhor.de && d <= melhor.de + 5);
      lista.push({
        id: 'concentrados',
        tone: 'brand',
        titulo: 'Vencimentos concentrados',
        texto: `${formatCurrency(melhor.valor, true)} em ${melhor.qtd} contas vencem entre os dias ${Math.min(...dias)} e ${Math.max(...dias)}. Mudar o vencimento de alguma delas para outra data alivia o caixa nessa semana.`,
        tag: 'Dica',
      });
    }
  }

  // 7. Financiamentos: antecipar parcelas (com juros) ou pedir a taxa
  v.financiamentos
    .filter((f) => f.restantes >= 1)
    .forEach((f) => {
      if (f.jurosMes && f.jurosMes > 0) {
        const i = f.jurosMes / 100;
        const valorHoje = f.valor / Math.pow(1 + i, f.restantes);
        const economia = f.valor - valorHoje;
        if (economia >= 1) {
          lista.push({
            id: `antecipar-${f.contaId}`,
            tone: 'violet',
            titulo: `Antecipar parcelas de ${f.descricao}`,
            texto: `Com juros de ${f.jurosMes.toLocaleString('pt-BR')}% a.m., a última parcela (${f.total}ª) quitada hoje sairia por cerca de ${formatCurrency(valorHoje, true)} em vez de ${formatCurrency(f.valor, true)}: ${formatCurrency(economia, true)} a menos em cada parcela antecipada, das últimas para as primeiras.`,
            tag: 'Dica',
          });
        }
      } else if (f.restantes >= 6) {
        lista.push({
          id: `juros-${f.contaId}`,
          tone: 'violet',
          titulo: `${f.descricao}: faltam ${f.restantes} parcelas`,
          texto: `São ${formatCurrency(f.saldo, true)} a pagar. Informe a taxa de juros no cadastro para calcular quanto você economiza antecipando parcelas.`,
          tag: 'Dica',
        });
      }
    });

  // 8. Contas com valor estimado aguardando confirmação
  const estimadas = doMes.filter((l) => l.valorEstimado && !l.paga);
  if (estimadas.length > 0) {
    lista.push({
      id: 'estimadas',
      tone: 'neutral',
      titulo: `${estimadas.length} conta${estimadas.length === 1 ? '' : 's'} com valor estimado`,
      texto: `${estimadas.map((l) => l.descricao).join(', ')}: confirme o valor quando a conta chegar para os totais e alertas ficarem exatos.`,
      tag: 'Pendente',
    });
  }

  const ordem: Tone[] = ['error', 'warning', 'success', 'info', 'brand', 'violet', 'neutral'];
  return lista.sort((a, b) => ordem.indexOf(a.tone) - ordem.indexOf(b.tone));
}
