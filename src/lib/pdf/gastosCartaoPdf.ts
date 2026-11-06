import type { jsPDF as JsPDF } from 'jspdf';
import type { Parcela } from '../../types/financas';
import type { ProximosMeses } from '../financas/proximosMeses';
import { rotuloMesAno } from '../financas/parcelas';
import { MONTHS_PT, formatCurrency, formatDateBR } from '../../utils/format';

export interface DadosPdfCartao {
  ano: string;
  mes: string;
  pessoa: string;
  cartao: string;
  /** Todas as parcelas do mês (base do total e do resumo) */
  parcelasMes: Parcela[];
  /** Parcelas listadas (podem estar filtradas por "Última parcela") */
  listadas: Parcela[];
  /** Descrição do filtro de última parcela quando ativo */
  filtroUltimaParcela?: string | null;
  /** Parcelas já assumidas nos próximos 12 meses (gráfico); omitido se não houver */
  proximos?: ProximosMeses | null;
}

const AZUL: [number, number, number] = [29, 78, 216];
const CINZA_900: [number, number, number] = [16, 24, 40];
const CINZA_600: [number, number, number] = [71, 84, 103];
const CINZA_200: [number, number, number] = [234, 236, 240];
const CINZA_50: [number, number, number] = [249, 250, 251];

const dir = (t: string) => ({ content: t, styles: { halign: 'right' as const } });
const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;
const soma = (ps: Parcela[]) => ps.reduce((a, p) => a + (Number(p.valorParcela) || 0), 0);
const rotuloCartao = (c: string) => (c && c.toUpperCase() !== 'TODOS' ? c : 'Todos');

type Rgb = [number, number, number];
const VERDE_CLARO: Rgb = [236, 253, 243];
const VERDE_BORDA: Rgb = [108, 233, 166];
const VERMELHO: Rgb = [217, 45, 32];
const compacto = (v: number) =>
  Math.abs(v) >= 1000 ? `${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k` : String(Math.round(v));

function passoDoEixo(max: number): number {
  const passos = [100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000, 20000, 25000, 50000];
  return passos.find((p) => max / p <= 5) ?? Math.ceil(max / 5);
}

/** Desenha o gráfico "Próximos 12 meses no cartão" a partir de `y` e devolve onde ele termina. */
function desenharProximos(doc: JsPDF, p: ProximosMeses, x: number, y: number, largura: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...CINZA_900);
  doc.text('Próximos 12 meses no cartão', x, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...CINZA_600);
  const livreDe =
    p.livreDeParcelasIdx === null
      ? 'sem parcelas futuras'
      : p.continuaDepois
        ? `ainda há parcelas após ${rotuloMesAno(p.pontos.at(-1)!.idx)}`
        : `cartão livre de parcelas a partir de ${rotuloMesAno(p.livreDeParcelasIdx)}`;
  doc.text(
    `Parcelas já assumidas: ${formatCurrency(p.comprometido)} em 12 meses   ·   média de ${formatCurrency(p.media)}/mês   ·   ${livreDe}`,
    x,
    y + 5,
  );

  // Legenda
  let lx = x;
  const ly = y + 11;
  const item = (cor: Rgb, texto: string, tipo: 'cheio' | 'livre' | 'linha' = 'cheio') => {
    if (tipo === 'linha') {
      doc.setDrawColor(...cor);
      doc.setLineWidth(0.5);
      doc.setLineDashPattern([1.2, 0.8], 0);
      doc.line(lx, ly - 1, lx + 4, ly - 1);
      doc.setLineDashPattern([], 0);
    } else {
      doc.setFillColor(...cor);
      if (tipo === 'livre') {
        doc.setDrawColor(...VERDE_BORDA);
        doc.setLineWidth(0.2);
        doc.setLineDashPattern([0.6, 0.4], 0);
        doc.rect(lx, ly - 2.4, 2.8, 2.8, 'FD');
        doc.setLineDashPattern([], 0);
      } else doc.rect(lx, ly - 2.4, 2.8, 2.8, 'F');
    }
    doc.setFontSize(7.5);
    doc.setTextColor(...CINZA_600);
    doc.text(texto, lx + (tipo === 'linha' ? 5.5 : 4.2), ly);
    lx += (tipo === 'linha' ? 5.5 : 4.2) + doc.getTextWidth(texto) + 5;
  };
  item(AZUL, 'Parcelas do mês');
  if (p.orcamento) {
    item(VERDE_CLARO, 'Livre para compras novas', 'livre');
    item(VERMELHO, 'Orçamento mensal', 'linha');
  }

  // Área do gráfico
  const topo = y + 18;
  const altura = 56;
  const base = topo + altura;
  const eixoX = x + 11;
  const larguraGrafico = largura - 11;
  const maxDados = Math.max(p.orcamento ?? 0, ...p.pontos.map((pt) => pt.total), 1) * 1.12;
  const passo = passoDoEixo(maxDados);
  const max = Math.ceil(maxDados / passo) * passo;
  const yDe = (v: number) => base - (v / max) * altura;

  doc.setLineWidth(0.15);
  doc.setFontSize(7);
  for (let v = 0; v <= max + 0.001; v += passo) {
    doc.setDrawColor(...CINZA_200);
    doc.line(eixoX, yDe(v), x + largura, yDe(v));
    doc.setTextColor(...CINZA_600);
    doc.text(compacto(v), eixoX - 2, yDe(v) + 1, { align: 'right' });
  }

  const slot = larguraGrafico / p.pontos.length;
  const larguraBarra = Math.min(slot * 0.58, 10);
  p.pontos.forEach((pt, k) => {
    const bx = eixoX + k * slot + (slot - larguraBarra) / 2;
    const acumulado = pt.total;
    if (pt.total > 0) {
      doc.setFillColor(...AZUL);
      doc.rect(bx, yDe(pt.total), larguraBarra, base - yDe(pt.total), 'F');
    }
    if (p.orcamento && pt.livre > 0) {
      doc.setFillColor(...VERDE_CLARO);
      doc.setDrawColor(...VERDE_BORDA);
      doc.setLineWidth(0.2);
      doc.setLineDashPattern([0.8, 0.5], 0);
      doc.rect(bx, yDe(acumulado + pt.livre), larguraBarra, yDe(acumulado) - yDe(acumulado + pt.livre), 'FD');
      doc.setLineDashPattern([], 0);
    }
    if (pt.total > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(...CINZA_900);
      doc.text(compacto(pt.total), bx + larguraBarra / 2, yDe(pt.total) - 1.2, { align: 'center' });
      doc.setFont('helvetica', 'normal');
    }
    doc.setFontSize(7);
    doc.setTextColor(...CINZA_600);
    doc.text(pt.rotulo, bx + larguraBarra / 2, base + 4, { align: 'center' });
  });

  if (p.orcamento) {
    doc.setDrawColor(...VERMELHO);
    doc.setLineWidth(0.4);
    doc.setLineDashPattern([1.5, 1], 0);
    doc.line(eixoX, yDe(p.orcamento), x + largura, yDe(p.orcamento));
    doc.setLineDashPattern([], 0);
  }
  doc.setLineWidth(0.2);
  return base + 12;
}

/**
 * Gera e baixa o PDF com o total gasto no mês e a listagem das compras do cartão.
 * As bibliotecas de PDF são carregadas só quando o botão é usado.
 */
export async function exportarGastosCartaoPdf(d: DadosPdfCartao): Promise<void> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const larg = doc.internal.pageSize.getWidth();
  const margem = 14;
  const nomeMes = MONTHS_PT[Number(d.mes) - 1] ?? d.mes;
  const agora = new Date();

  // Cabeçalho
  doc.setFillColor(...AZUL);
  doc.rect(0, 0, larg, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...CINZA_900);
  doc.text(`Gastos no cartão - ${nomeMes} de ${d.ano}`, margem, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...CINZA_600);
  doc.text(
    `Pessoa: ${d.pessoa}   ·   Cartão: ${rotuloCartao(d.cartao)}   ·   Gerado em ${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    margem,
    25,
  );

  // Resumo
  const aVista = d.parcelasMes.filter((p) => p.numeroTotalParcela === 1);
  const parceladas = d.parcelasMes.filter((p) => p.numeroTotalParcela > 1);
  const ultimas = parceladas.filter((p) => p.numeroParcela === p.numeroTotalParcela);
  const cards: [string, string, string][] = [
    [
      'Total gasto no mês',
      formatCurrency(soma(d.parcelasMes)),
      plural(d.parcelasMes.length, 'lançamento', 'lançamentos'),
    ],
    ['À vista', formatCurrency(soma(aVista)), plural(aVista.length, 'compra', 'compras')],
    ['Parcelado', formatCurrency(soma(parceladas)), plural(parceladas.length, 'parcela', 'parcelas')],
    ['Terminam este mês', formatCurrency(soma(ultimas)), plural(ultimas.length, 'parcelamento', 'parcelamentos')],
  ];
  const gap = 4;
  const w = (larg - margem * 2 - gap * 3) / 4;
  cards.forEach(([rotulo, valor, rodape], i) => {
    const x = margem + i * (w + gap);
    doc.setDrawColor(...CINZA_200);
    doc.setFillColor(...(i === 0 ? ([239, 244, 255] as [number, number, number]) : CINZA_50));
    doc.roundedRect(x, 31, w, 22, 2, 2, 'FD');
    doc.setFontSize(8.5);
    doc.setTextColor(...CINZA_600);
    doc.text(rotulo, x + 3.5, 37);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(i === 0 ? 13 : 11.5);
    doc.setTextColor(...(i === 0 ? AZUL : CINZA_900));
    doc.text(valor, x + 3.5, 44.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...CINZA_600);
    doc.text(rodape, x + 3.5, 50);
  });

  let y = 64;
  if (d.proximos && d.proximos.comprometido > 0) {
    y = desenharProximos(doc, d.proximos, margem, y, larg - margem * 2);
  }

  // Listagem
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...CINZA_900);
  doc.text('Compras do mês', margem, y);
  if (d.filtroUltimaParcela) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...CINZA_600);
    doc.text(`Filtro aplicado: ${d.filtroUltimaParcela}`, margem + 40, y);
  }

  const linhas = [...d.listadas].sort(
    (a, b) => a.dataCompra.localeCompare(b.dataCompra) || a.nomeCompra.localeCompare(b.nomeCompra),
  );
  autoTable(doc, {
    startY: y + 3,
    margin: { left: margem, right: margem, bottom: 16 },
    head: [
      [
        'Data',
        'Descrição',
        { content: 'Parcela', styles: { halign: 'center' } },
        dir('Valor da parcela'),
        dir('Valor total'),
      ],
    ],
    body: linhas.map((p) => [
      formatDateBR(p.dataCompra),
      p.nomeCompra,
      p.numeroTotalParcela > 1 ? `${p.numeroParcela}/${p.numeroTotalParcela}` : 'À vista',
      formatCurrency(Number(p.valorParcela) || 0),
      formatCurrency(Number(p.valorTotal) || 0),
    ]),
    foot: [['', plural(linhas.length, 'lançamento', 'lançamentos'), 'Total', dir(formatCurrency(soma(linhas))), '']],
    theme: 'striped',
    styles: { fontSize: 8.5, cellPadding: 2, textColor: CINZA_900, overflow: 'linebreak' },
    headStyles: { fillColor: AZUL, textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: CINZA_200, textColor: CINZA_900, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: CINZA_50 },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 32, halign: 'right' },
    },
    didDrawPage: () => {
      const alt = doc.internal.pageSize.getHeight();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...CINZA_600);
      doc.text('Kowalski House · Gestão de Cartão', margem, alt - 8);
    },
  });

  // Numeração das páginas
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...CINZA_600);
    doc.text(`Página ${i} de ${total}`, larg - margem, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
  }

  const arquivo = `gastos-cartao-${d.ano}-${String(d.mes).padStart(2, '0')}-${d.pessoa}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9-]+/g, '-');
  doc.save(`${arquivo}.pdf`);
}
