import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { PageHeader } from '../../components/ui/PageHeader';
import { FloatingAction } from '../../components/ui/FloatingAction';
import { TransacaoModal, type AbaTransacao } from '../../components/financas/TransacaoModal';
import { TransacoesTable, type AcaoTransacao } from '../../components/financas/TransacoesTable';
import { ExclusaoTransacaoDialog } from '../../components/financas/ExclusaoTransacaoDialog';
import { GestaoFinanceiraProvider, useGestaoFinanceira } from '../../contexts/GestaoFinanceiraContext';
import { useToast } from '../../contexts/ToastContext';
import { simularCompra } from '../../lib/financas/analise';
import type { Parcela } from '../../types/financas';
import { MONTHS_PT } from '../../utils/format';
import { Filtros } from './Filtros';
import { Resumo } from './Resumo';
import { Insights, SaudeFinanceira } from './Insights';
import {
  EvolucaoMensal,
  MaioresGastos,
  PorCartao,
  PorCategoria,
  PorDiaDaSemana,
  ProjecaoCompromissos,
  ProximasParcelas,
} from './Graficos';

const linha = (colunas: object) => ({
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', ...colunas },
  gap: { xs: 2, md: 2.5 },
});

function GestaoFinanceiraConteudo() {
  const ctx = useGestaoFinanceira();
  const { notify } = useToast();
  const [modal, setModal] = useState<{ parcela: Parcela | null; aba: AbaTransacao } | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Parcela | null>(null);
  const [categoria, setCategoria] = useState<string | null>(null);

  useEffect(() => setCategoria(null), [ctx.filtrosAplicados]);

  const recorrentes = useMemo(() => new Set((ctx.analise?.recorrentes ?? []).map((r) => r.nome)), [ctx.analise]);
  const nomeMes = ctx.filtrosAplicados ? MONTHS_PT[Number(ctx.filtrosAplicados.mes) - 1] : '';

  const onAcao = (acao: AcaoTransacao, p: Parcela) => {
    if (acao === 'excluir') setParaExcluir(p);
    else setModal({ parcela: p, aba: acao === 'cancelar' ? 'cancelar' : 'dados' });
  };
  const nova = () => setModal({ parcela: null, aba: 'dados' });

  const simular = (valor: number, n: number, data: string) =>
    ctx.analise ? simularCompra(ctx.analise, valor, n, data, ctx.orcamento) : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
      <PageHeader
        section="Finanças"
        title="Gestão Financeira"
        subtitle="Gastos, compromissos futuros e oportunidades de economia"
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

      <Filtros />
      {!ctx.filtrosAplicados && !ctx.carregando && (
        <Alert severity="info">Selecione ano, mês e pessoa e clique em Buscar.</Alert>
      )}

      <Resumo />

      <Box sx={linha({ lg: 'minmax(320px, 1fr) minmax(0, 2fr)' })}>
        <SaudeFinanceira />
        <Insights />
      </Box>

      <Box sx={linha({ lg: 'minmax(0, 2fr) minmax(320px, 1fr)' })}>
        <EvolucaoMensal />
        <PorCategoria selecionada={categoria} onSelecionar={setCategoria} />
      </Box>

      <Box sx={linha({ lg: 'minmax(0, 2fr) minmax(320px, 1fr)' })}>
        <ProjecaoCompromissos />
        <ProximasParcelas />
      </Box>

      <Box sx={linha({ md: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' })}>
        <PorCartao />
        <PorDiaDaSemana />
        <MaioresGastos />
      </Box>

      <TransacoesTable
        titulo={nomeMes ? `Transações de ${nomeMes}` : 'Transações'}
        parcelas={ctx.parcelasMes}
        loading={ctx.loading}
        categoria={categoria}
        onLimparCategoria={() => setCategoria(null)}
        recorrentes={recorrentes}
        onAcao={onAcao}
      />

      <TransacaoModal
        open={Boolean(modal)}
        parcela={modal?.parcela ?? null}
        abaInicial={modal?.aba}
        categorias={ctx.categorias}
        tiposLancamento={ctx.tiposLancamento}
        onSalvar={ctx.salvarCompra}
        simular={simular}
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

export function GestaoFinanceira() {
  return (
    <GestaoFinanceiraProvider>
      <GestaoFinanceiraConteudo />
    </GestaoFinanceiraProvider>
  );
}
