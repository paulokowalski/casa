import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Checkbox, Chip, IconButton, Link, Tooltip, Typography } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { SectionCard } from '../../components/ui/SectionCard';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { StatusPill } from '../../components/ui/StatusPill';
import { useGestaoFinanceira } from '../../contexts/GestaoFinanceiraContext';
import type { LinhaConta } from '../../lib/financas/visaoMensal';
import type { Lancamento } from '../../types/contas';
import type { Tone } from '../../styles/tokens';
import { MONTHS_PT, formatCurrency, formatDateBR } from '../../utils/format';

type Filtro = 'todas' | 'pagar' | 'pagas' | 'recorrentes' | 'parceladas';

const TIPO: Record<LinhaConta['tipo'], { rotulo: string; tom: Tone }> = {
  RECORRENTE: { rotulo: 'Todo mês', tom: 'neutral' },
  PARCELADA: { rotulo: 'Parcelada', tom: 'brand' },
  UNICA: { rotulo: 'Única', tom: 'neutral' },
  CARTAO: { rotulo: 'Cartão', tom: 'info' },
};

function situacao(l: LinhaConta): { texto: string; tom: Tone } {
  switch (l.situacao) {
    case 'paga':
      return { texto: 'Paga', tom: 'success' };
    case 'atrasada':
      return { texto: `Atrasada ${-(l.diasParaVencer ?? 0)} dia${l.diasParaVencer === -1 ? '' : 's'}`, tom: 'error' };
    case 'hoje':
      return { texto: 'Vence hoje', tom: 'warning' };
    case 'breve':
      return { texto: `Vence em ${l.diasParaVencer} dia${l.diasParaVencer === 1 ? '' : 's'}`, tom: 'warning' };
    case 'cartao':
      return { texto: 'A pagar', tom: 'neutral' };
    default:
      return { texto: 'Pendente', tom: 'neutral' };
  }
}

interface ContasTableProps {
  onEditar: (contaId: string) => void;
  onExcluir: (contaId: string, descricao: string) => void;
  onConfirmarValor: (l: Lancamento) => void;
  onAlternarPaga: (l: Lancamento) => void;
  onAlternarFatura: (paga: boolean) => void;
}

export function ContasTable({
  onEditar,
  onExcluir,
  onConfirmarValor,
  onAlternarPaga,
  onAlternarFatura,
}: Readonly<ContasTableProps>) {
  const { visao: v, loading, mes } = useGestaoFinanceira();
  const [filtro, setFiltro] = useState<Filtro>('todas');

  const linhas = useMemo(() => v?.linhas ?? [], [v]);
  const visiveis = useMemo(
    () =>
      linhas.filter((l) => {
        if (filtro === 'pagar') return !l.paga;
        if (filtro === 'pagas') return l.paga;
        if (filtro === 'recorrentes') return l.tipo === 'RECORRENTE';
        if (filtro === 'parceladas') return l.tipo === 'PARCELADA';
        return true;
      }),
    [linhas, filtro],
  );
  const qtdPagar = linhas.filter((l) => !l.paga).length;
  const qtdPagas = linhas.filter((l) => l.paga).length;
  const nomeMes = MONTHS_PT[mes - 1]?.toLowerCase();

  const chips: { id: Filtro; rotulo: string }[] = [
    { id: 'todas', rotulo: 'Todas' },
    { id: 'pagar', rotulo: `A pagar (${qtdPagar})` },
    { id: 'pagas', rotulo: `Pagas (${qtdPagas})` },
    { id: 'recorrentes', rotulo: 'Todo mês' },
    { id: 'parceladas', rotulo: 'Parceladas' },
  ];

  const check = (l: LinhaConta) => (
    <Tooltip title={l.paga ? 'Desmarcar como paga' : 'Marcar como paga'} describeChild>
      <Checkbox
        checked={l.paga}
        onChange={() => (l.lancamento ? onAlternarPaga(l.lancamento) : onAlternarFatura(!l.paga))}
        inputProps={{ 'aria-label': `${l.paga ? 'Desmarcar' : 'Marcar'} ${l.descricao} como paga` }}
        size="small"
      />
    </Tooltip>
  );

  const valor = (l: LinhaConta) =>
    l.lancamento?.valorEstimado && !l.lancamento.paga ? (
      <Tooltip title="Valor estimado. Clique para informar o valor real." describeChild>
        <Link
          component="button"
          type="button"
          onClick={() => l.lancamento && onConfirmarValor(l.lancamento)}
          sx={{ fontWeight: 600 }}
        >
          ≈ {formatCurrency(l.valor)}
        </Link>
      </Tooltip>
    ) : (
      <Typography fontWeight={600} component="span">
        {formatCurrency(l.valor)}
      </Typography>
    );

  const acoes = (l: LinhaConta) =>
    l.lancamento ? (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Tooltip title="Editar conta">
          <IconButton
            aria-label={`Editar ${l.descricao}`}
            onClick={() => l.lancamento && onEditar(l.lancamento.contaId)}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir ou encerrar">
          <IconButton
            aria-label={`Excluir ${l.descricao}`}
            onClick={() => l.lancamento && onExcluir(l.lancamento.contaId, l.descricao)}
            sx={{ color: 'error.main' }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ) : (
      <Link component={RouterLink} to="/gestao-cartao" variant="body2" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>
        Ver na Gestão de Cartão
      </Link>
    );

  const columns: DataColumn<LinhaConta>[] = [
    { id: 'paga', header: 'Paga', width: 56, render: check },
    {
      id: 'conta',
      header: 'Conta',
      render: (l) => (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography fontWeight={500}>{l.descricao}</Typography>
            <StatusPill tone={TIPO[l.tipo].tom} size="sm">
              {TIPO[l.tipo].rotulo}
            </StatusPill>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {l.detalhe}
          </Typography>
        </Box>
      ),
    },
    { id: 'categoria', header: 'Categoria', render: (l) => <Chip size="small" label={l.categoria} /> },
    {
      id: 'vencimento',
      header: 'Vencimento',
      render: (l) => (l.vencimento ? formatDateBR(l.vencimento).slice(0, 5) : '—'),
    },
    { id: 'valor', header: 'Valor', align: 'right', render: valor },
    {
      id: 'situacao',
      header: 'Situação',
      render: (l) => {
        const s = situacao(l);
        return <StatusPill tone={s.tom}>{s.texto}</StatusPill>;
      },
    },
    { id: 'acoes', header: '', align: 'right', width: 112, render: acoes },
  ];

  return (
    <SectionCard
      title={`Contas de ${nomeMes}`}
      subtitle={
        v
          ? `${v.qtdContas} conta${v.qtdContas === 1 ? '' : 's'}${v.cartaoMes > 0 ? ' + fatura do cartão' : ''} · ${formatCurrency(v.aPagar)} a pagar`
          : undefined
      }
      action={
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {chips.map((c) => (
            <Chip
              key={c.id}
              label={c.rotulo}
              onClick={() => setFiltro(c.id)}
              color={filtro === c.id ? 'primary' : 'default'}
              variant={filtro === c.id ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      }
      padding="flush"
    >
      <DataTable
        columns={columns}
        rows={visiveis}
        getRowKey={(l) => l.chave}
        loading={loading}
        minWidth={900}
        defaultRowsPerPage={25}
        emptyMessage="Nenhuma conta neste mês. Use “Nova conta” para cadastrar."
        rowSx={(l) => (l.tipo === 'CARTAO' ? { bgcolor: 'grey.50' } : undefined)}
        footer={
          v ? (
            <Typography variant="body2" color="text.secondary">
              Total do mês <b>{formatCurrency(v.totalMes)}</b>
            </Typography>
          ) : undefined
        }
        renderMobileRow={(l) => {
          const s = situacao(l);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {check(l)}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={600} noWrap>
                  {l.descricao}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {l.vencimento ? `${formatDateBR(l.vencimento).slice(0, 5)} · ` : ''}
                  {l.detalhe}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                {valor(l)}
                <Box sx={{ mt: 0.5 }}>
                  <StatusPill tone={s.tom} size="sm">
                    {s.texto}
                  </StatusPill>
                </Box>
              </Box>
              {l.lancamento ? (
                <IconButton
                  aria-label={`Editar ${l.descricao}`}
                  onClick={() => l.lancamento && onEditar(l.lancamento.contaId)}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              ) : null}
            </Box>
          );
        }}
      />
    </SectionCard>
  );
}
