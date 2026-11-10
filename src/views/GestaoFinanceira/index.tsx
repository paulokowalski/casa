import { useState } from 'react';
import { Alert, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { PageHeader } from '../../components/ui/PageHeader';
import { FloatingAction } from '../../components/ui/FloatingAction';
import { GestaoFinanceiraProvider, useGestaoFinanceira } from '../../contexts/GestaoFinanceiraContext';
import { useToast } from '../../contexts/ToastContext';
import type { Conta, Lancamento } from '../../types/contas';
import { Filtros } from './Filtros';
import { Resumo } from './Resumo';
import { Equilibrio, ParaOndeVai } from './Composicao';
import { Evolucao } from './Evolucao';
import { Futuro } from './Futuro';
import { Insights } from './Insights';
import { Financiamentos } from './Financiamentos';
import { ContasTable } from './ContasTable';
import { ContaModal } from './ContaModal';
import { ExcluirContaDialog, ValorDialog } from './Dialogos';

const linha = (colunas: object) => ({
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', ...colunas },
  gap: { xs: 2, md: 2.5 },
});

function GestaoFinanceiraConteudo() {
  const ctx = useGestaoFinanceira();
  const { notify } = useToast();
  const [modal, setModal] = useState<{ conta: Conta | null } | null>(null);
  const [paraExcluir, setParaExcluir] = useState<{ id: string; descricao: string } | null>(null);
  const [valorDe, setValorDe] = useState<Lancamento | null>(null);

  const nova = () => setModal({ conta: null });
  const editar = (contaId: string) => {
    const conta = ctx.contas.find((c) => c.id === contaId);
    if (conta) setModal({ conta });
  };

  const alternarPaga = async (l: Lancamento) => {
    try {
      await ctx.atualizarLancamento(l.id, { paga: !l.paga });
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Erro ao atualizar.', 'error');
    }
  };

  const alternarFatura = async (paga: boolean) => {
    try {
      await ctx.marcarFatura(paga);
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Erro ao atualizar a fatura.', 'error');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
      <PageHeader
        section="Finanças"
        title="Gestão Financeira"
        subtitle="Tudo o que sai no mês: contas fixas, financiamentos e o cartão de crédito"
      />

      <Filtros />
      {ctx.erro && <Alert severity="error">{ctx.erro}</Alert>}
      {!ctx.pessoa && !ctx.loading && <Alert severity="info">Cadastre uma pessoa para começar.</Alert>}

      <Resumo />

      <Box sx={linha({ lg: 'repeat(2, minmax(0, 1fr))' })}>
        <ParaOndeVai />
        <Equilibrio />
      </Box>

      <Futuro />

      <Box sx={linha({ lg: 'minmax(0, 1fr) minmax(0, 1fr)' })}>
        <Evolucao />
        <Insights />
      </Box>

      <Financiamentos />

      <ContasTable
        onEditar={editar}
        onExcluir={(id, descricao) => setParaExcluir({ id, descricao })}
        onConfirmarValor={setValorDe}
        onAlternarPaga={alternarPaga}
        onAlternarFatura={alternarFatura}
      />

      <ContaModal
        open={Boolean(modal)}
        conta={modal?.conta ?? null}
        onClose={() => setModal(null)}
        onSucesso={notify}
        onExcluir={(c) => {
          setModal(null);
          setParaExcluir({ id: c.id, descricao: c.descricao });
        }}
      />
      <ExcluirContaDialog
        conta={paraExcluir}
        competencia={ctx.competencia}
        onExcluir={ctx.excluirConta}
        onClose={() => setParaExcluir(null)}
        onSucesso={notify}
      />
      <ValorDialog
        lancamento={valorDe}
        onClose={() => setValorDe(null)}
        onConfirmar={async (valor, paga) => {
          await ctx.atualizarLancamento(valorDe!.id, paga ? { valor, paga: true } : { valor });
          notify('Valor confirmado.');
        }}
      />
      <FloatingAction label="Nova conta" icon={<AddIcon />} onClick={nova} />
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
