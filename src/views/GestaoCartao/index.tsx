import { useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { PageHeader } from '../../components/ui/PageHeader';
import { KpiCard } from '../../components/ui/KpiCard';
import { SectionCard } from '../../components/ui/SectionCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { FloatingAction } from '../../components/ui/FloatingAction';
import { CategoryBars } from '../../components/charts/CategoryBars';
import { ShareBar } from '../../components/charts/ShareBar';
import { TransacaoModal, type AbaTransacao } from '../../components/financas/TransacaoModal';
import { TransacoesTable, type AcaoTransacao } from '../../components/financas/TransacoesTable';
import { ExclusaoTransacaoDialog } from '../../components/financas/ExclusaoTransacaoDialog';
import { GestaoCartaoProvider, useGestaoCartao } from '../../contexts/GestaoCartaoContext';
import { useToast } from '../../contexts/ToastContext';
import type { Parcela } from '../../types/financas';
import { MONTHS_PT, formatCurrency } from '../../utils/format';
import { Filtro } from './Filtro';
import { GraficoDespesasMensais } from './GraficoDespesasMensais';

function somarPor(parcelas: Parcela[], chave: (p: Parcela) => string) {
  const mapa = new Map<string, number>();
  parcelas.forEach((p) => mapa.set(chave(p), (mapa.get(chave(p)) ?? 0) + (Number(p.valorParcela) || 0)));
  return [...mapa.entries()].map(([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor);
}

function GestaoCartaoConteudo() {
  const ctx = useGestaoCartao();
  const { notify } = useToast();
  const [modal, setModal] = useState<{ parcela: Parcela | null; aba: AbaTransacao } | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Parcela | null>(null);
  const [categoria, setCategoria] = useState<string | null>(null);

  const porCartao = useMemo(() => somarPor(ctx.compras, (p) => p.nomeCartao || 'Sem cartão'), [ctx.compras]);
  const porCategoria = useMemo(
    () => somarPor(ctx.compras, (p) => (p.categoria || '').toUpperCase() || 'SEM CATEGORIA'),
    [ctx.compras],
  );

  const aplicados = ctx.filtrosAplicados;
  const nomeMes = aplicados ? MONTHS_PT[Number(aplicados.mes) - 1] : '';
  const qtdAVista = ctx.compras.filter((p) => p.numeroTotalParcela === 1).length;
  const qtdParceladas = ctx.compras.length - qtdAVista;

  const onAcao = (acao: AcaoTransacao, p: Parcela) => {
    if (acao === 'excluir') setParaExcluir(p);
    else setModal({ parcela: p, aba: acao === 'cancelar' ? 'cancelar' : 'dados' });
  };
  const nova = () => setModal({ parcela: null, aba: 'dados' });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
      <PageHeader
        section="Finanças"
        title="Gestão de Cartão"
        subtitle="Despesas e parcelamentos por mês"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={nova}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Nova transação
          </Button>
        }
      />

      <Filtro />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: { xs: 1.5, md: 2.5 },
        }}
      >
        <KpiCard
          label="À vista no cartão"
          icon={<CreditCardOutlinedIcon />}
          tone="brand"
          loading={ctx.loading}
          value={formatCurrency(ctx.despesa?.gastosNoCartao ?? 0)}
          footer={`${qtdAVista} compra${qtdAVista === 1 ? '' : 's'}`}
        />
        <KpiCard
          label="Parceladas"
          icon={<ReceiptLongOutlinedIcon />}
          tone="warning"
          loading={ctx.loading}
          value={formatCurrency(ctx.despesa?.comprasParceladas ?? 0)}
          footer={`${qtdParceladas} parcela${qtdParceladas === 1 ? '' : 's'} no mês`}
        />
        <KpiCard
          label={nomeMes ? `Total de ${nomeMes}` : 'Total do mês'}
          icon={<AccountBalanceWalletOutlinedIcon />}
          tone="success"
          loading={ctx.loading}
          value={formatCurrency(ctx.despesa?.valorMes ?? 0)}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(0, 1fr)' },
          gap: { xs: 2, md: 2.5 },
        }}
      >
        <GraficoDespesasMensais />
        <SectionCard title="Por cartão" subtitle="Participação no mês">
          {porCartao.length === 0 ? (
            <EmptyState message="Sem gastos no período." compact />
          ) : (
            <ShareBar itens={porCartao} />
          )}
        </SectionCard>
      </Box>

      <SectionCard title="Por categoria" subtitle="Clique em uma categoria para filtrar as transações">
        {porCategoria.length === 0 ? (
          <EmptyState message="Sem gastos no período." compact />
        ) : (
          <Box sx={{ columnCount: { xs: 1, md: 2 }, columnGap: 6, '& > ul > li': { breakInside: 'avoid' } }}>
            <CategoryBars itens={porCategoria} selecionada={categoria} onSelecionar={setCategoria} max={12} />
          </Box>
        )}
      </SectionCard>

      <TransacoesTable
        titulo={nomeMes ? `Transações de ${nomeMes}` : 'Transações'}
        parcelas={ctx.compras}
        loading={ctx.loading}
        categoria={categoria}
        onLimparCategoria={() => setCategoria(null)}
        onAcao={onAcao}
      />

      <TransacaoModal
        open={Boolean(modal)}
        parcela={modal?.parcela ?? null}
        abaInicial={modal?.aba}
        categorias={ctx.categorias}
        tiposLancamento={ctx.tiposLancamento}
        onSalvar={ctx.salvarCompra}
        onClose={() => setModal(null)}
        onSucesso={notify}
      />
      <ExclusaoTransacaoDialog
        parcela={paraExcluir}
        onExcluir={ctx.excluirCompra}
        onClose={() => setParaExcluir(null)}
        onSucesso={notify}
        onCancelarParcelas={(p) => {
          setParaExcluir(null);
          setModal({ parcela: p, aba: 'cancelar' });
        }}
      />
      <FloatingAction label="Nova transação" icon={<AddIcon />} onClick={nova} />
    </Box>
  );
}

export function GestaoCartao() {
  return (
    <GestaoCartaoProvider>
      <GestaoCartaoConteudo />
    </GestaoCartaoProvider>
  );
}
