import { useMemo, useState, type MouseEvent } from 'react';
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  ListItemIcon,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { DataTable, type DataColumn } from '../ui/DataTable';
import { SectionCard } from '../ui/SectionCard';
import { StatusPill } from '../ui/StatusPill';
import { lerCancelamento, nomeSemMarcacao } from '../../lib/financas/parcelas';
import { palette, tones } from '../../styles/tokens';
import type { Parcela } from '../../types/financas';
import { capitalize, formatCurrency, formatDateBR } from '../../utils/format';

type FiltroRapido = 'parceladas' | 'ultima' | 'canceladas';

export type AcaoTransacao = 'editar' | 'cancelar' | 'excluir';

interface TransacoesTableProps {
  titulo: string;
  parcelas: Parcela[];
  loading?: boolean;
  /** Categoria selecionada em um gráfico (filtra a tabela) */
  categoria?: string | null;
  onLimparCategoria?: () => void;
  /** Nomes de compras recorrentes (assinaturas), em maiúsculas */
  recorrentes?: Set<string>;
  onAcao: (acao: AcaoTransacao, parcela: Parcela) => void;
}

const categoriaDe = (p: Parcela) => (p.categoria || '').toUpperCase() || 'SEM CATEGORIA';

function ProgressoParcela({ p }: Readonly<{ p: Parcela }>) {
  const ultima = p.numeroParcela === p.numeroTotalParcela;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <span>
        {p.numeroParcela}/{p.numeroTotalParcela}
      </span>
      {p.numeroTotalParcela > 1 && (
        <Box
          sx={{ width: 48, height: 6, borderRadius: 99, bgcolor: palette.gray[100], overflow: 'hidden' }}
          aria-hidden="true"
        >
          <Box
            sx={{
              width: `${(p.numeroParcela / p.numeroTotalParcela) * 100}%`,
              height: '100%',
              bgcolor: ultima ? tones.success.solid : tones.warning.solid,
            }}
          />
        </Box>
      )}
    </Box>
  );
}

function Selos({ p, recorrente }: Readonly<{ p: Parcela; recorrente: boolean }>) {
  const cancel = lerCancelamento(p.nomeCompra);
  const ultima = p.numeroTotalParcela > 1 && p.numeroParcela === p.numeroTotalParcela;
  return (
    <>
      {cancel && (
        <StatusPill tone="error" size="sm">
          Cancelada {cancel.pagas}/{cancel.totalOriginal}
        </StatusPill>
      )}
      {ultima && !cancel && (
        <StatusPill tone="success" size="sm">
          Última
        </StatusPill>
      )}
      {p.valorParcela < 0 && (
        <StatusPill tone="success" size="sm">
          Estorno
        </StatusPill>
      )}
      {recorrente && (
        <StatusPill tone="violet" size="sm">
          Recorrente
        </StatusPill>
      )}
    </>
  );
}

/** Tabela de transações (parcelas do mês) com busca, filtros rápidos e ações. */
export function TransacoesTable({
  titulo,
  parcelas,
  loading,
  categoria,
  onLimparCategoria,
  recorrentes,
  onAcao,
}: Readonly<TransacoesTableProps>) {
  const [busca, setBusca] = useState('');
  const [rapidos, setRapidos] = useState<FiltroRapido[]>([]);
  const [menu, setMenu] = useState<{ anchor: HTMLElement; parcela: Parcela } | null>(null);

  const linhas = useMemo(() => {
    const termo = busca.trim().toUpperCase();
    return parcelas.filter((p) => {
      if (categoria && categoriaDe(p) !== categoria) return false;
      if (termo && !`${p.nomeCompra} ${p.nomeCartao} ${p.categoria ?? ''}`.toUpperCase().includes(termo)) return false;
      if (rapidos.includes('parceladas') && p.numeroTotalParcela <= 1) return false;
      if (rapidos.includes('ultima') && !(p.numeroTotalParcela > 1 && p.numeroParcela === p.numeroTotalParcela))
        return false;
      if (rapidos.includes('canceladas') && !lerCancelamento(p.nomeCompra)) return false;
      return true;
    });
  }, [parcelas, busca, rapidos, categoria]);

  const total = linhas.reduce((a, p) => a + (Number(p.valorParcela) || 0), 0);
  const ehRecorrente = (p: Parcela) => Boolean(recorrentes?.has(p.nomeCompra.toUpperCase()));
  const podeCancelar = (p: Parcela) => p.numeroTotalParcela > 1 || Boolean(lerCancelamento(p.nomeCompra));

  const alternar = (f: FiltroRapido) =>
    setRapidos((atual) => (atual.includes(f) ? atual.filter((x) => x !== f) : [...atual, f]));

  const abrirMenu = (e: MouseEvent<HTMLElement>, parcela: Parcela) => setMenu({ anchor: e.currentTarget, parcela });

  const acoesDesktop = (p: Parcela) => (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Tooltip title="Editar">
        <IconButton aria-label={`Editar ${p.nomeCompra}`} onClick={() => onAcao('editar', p)}>
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {podeCancelar(p) && (
        <Tooltip title={lerCancelamento(p.nomeCompra) ? 'Ver cancelamento' : 'Cancelar parcelas restantes'}>
          <IconButton
            aria-label={`Cancelar parcelas de ${p.nomeCompra}`}
            onClick={() => onAcao('cancelar', p)}
            sx={{ color: 'warning.main' }}
          >
            <EventBusyOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Excluir">
        <IconButton
          aria-label={`Excluir ${p.nomeCompra}`}
          onClick={() => onAcao('excluir', p)}
          sx={{ color: 'error.main' }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const columns: DataColumn<Parcela>[] = [
    {
      id: 'descricao',
      header: 'Descrição',
      render: (p) => (
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            <Typography
              fontWeight={500}
              sx={{ color: lerCancelamento(p.nomeCompra) ? 'text.secondary' : 'text.primary' }}
            >
              {capitalize(nomeSemMarcacao(p.nomeCompra))}
            </Typography>
            <Selos p={p} recorrente={ehRecorrente(p)} />
          </Box>
          <Typography variant="caption">Compra em {formatDateBR(p.dataCompra)}</Typography>
        </Box>
      ),
    },
    {
      id: 'categoria',
      header: 'Categoria',
      render: (p) =>
        p.categoria ? (
          <StatusPill tone="neutral">{capitalize(p.categoria)}</StatusPill>
        ) : (
          <Typography color="text.secondary">—</Typography>
        ),
    },
    { id: 'cartao', header: 'Cartão', render: (p) => capitalize(p.nomeCartao) },
    { id: 'pessoa', header: 'Pessoa', render: (p) => capitalize(p.nomePessoa) },
    { id: 'parcela', header: 'Parcela', render: (p) => <ProgressoParcela p={p} /> },
    {
      id: 'valor',
      header: 'Valor',
      align: 'right',
      render: (p) => (
        <Typography fontWeight={600} sx={{ color: p.valorParcela < 0 ? tones.success.fg : 'text.primary' }}>
          {formatCurrency(p.valorParcela)}
        </Typography>
      ),
    },
    {
      id: 'restante',
      header: 'Restante',
      align: 'right',
      render: (p) => (
        <Typography color="text.secondary">
          {p.numeroTotalParcela > 1 ? formatCurrency(p.valorFaltante) : '—'}
        </Typography>
      ),
    },
    { id: 'acoes', header: '', align: 'right', width: 136, render: acoesDesktop },
  ];

  const chip = (f: FiltroRapido, label: string) => {
    const ativo = rapidos.includes(f);
    return (
      <Chip
        label={label}
        onClick={() => alternar(f)}
        color={ativo ? 'primary' : 'default'}
        variant={ativo ? 'filled' : 'outlined'}
        aria-pressed={ativo}
      />
    );
  };

  return (
    <SectionCard
      title={titulo}
      subtitle={`${parcelas.length} lançamento${parcelas.length === 1 ? '' : 's'}`}
      padding="flush"
      action={
        <Box
          sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', width: { xs: '100%', md: 'auto' } }}
        >
          <TextField
            size="small"
            placeholder="Buscar transação"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            inputProps={{ 'aria-label': 'Buscar transação' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: { xs: '1 1 100%', md: '0 0 220px' } }}
          />
          {categoria && <Chip label={capitalize(categoria)} onDelete={onLimparCategoria} color="primary" />}
          {chip('parceladas', 'Parceladas')}
          {chip('ultima', 'Última parcela')}
          {chip('canceladas', 'Canceladas')}
        </Box>
      }
    >
      <DataTable
        columns={columns}
        rows={linhas}
        getRowKey={(p) => `${p.id}-${p.numeroParcela}`}
        loading={loading}
        minWidth={960}
        emptyMessage={parcelas.length === 0 ? 'Nenhuma transação no período.' : 'Nenhuma transação com esses filtros.'}
        rowSx={(p) => (lerCancelamento(p.nomeCompra) ? { bgcolor: tones.error.bg } : undefined)}
        footer={
          <>
            Total: <b style={{ color: palette.gray[900] }}>{formatCurrency(total)}</b>
          </>
        }
        renderMobileRow={(p) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                <Typography fontWeight={600}>{capitalize(nomeSemMarcacao(p.nomeCompra))}</Typography>
                <Selos p={p} recorrente={ehRecorrente(p)} />
              </Box>
              <Typography variant="caption" component="div" sx={{ mt: 0.25 }}>
                {[
                  capitalize(p.nomeCartao),
                  p.categoria && capitalize(p.categoria),
                  p.numeroTotalParcela > 1 ? `${p.numeroParcela}/${p.numeroTotalParcela}` : formatDateBR(p.dataCompra),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography fontWeight={600} sx={{ color: p.valorParcela < 0 ? tones.success.fg : 'text.primary' }}>
                {formatCurrency(p.valorParcela)}
              </Typography>
              {p.numeroTotalParcela > 1 && p.valorFaltante > 0 && (
                <Typography variant="caption">resta {formatCurrency(p.valorFaltante, true)}</Typography>
              )}
            </Box>
            <IconButton aria-label={`Ações de ${p.nomeCompra}`} onClick={(e) => abrirMenu(e, p)} edge="end">
              <MoreVertIcon />
            </IconButton>
          </Box>
        )}
      />

      <Menu
        anchorEl={menu?.anchor}
        open={Boolean(menu)}
        onClose={() => setMenu(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {menu && [
          <MenuItem
            key="editar"
            onClick={() => {
              onAcao('editar', menu.parcela);
              setMenu(null);
            }}
          >
            <ListItemIcon>
              <EditOutlinedIcon fontSize="small" />
            </ListItemIcon>
            Editar
          </MenuItem>,
          podeCancelar(menu.parcela) && (
            <MenuItem
              key="cancelar"
              onClick={() => {
                onAcao('cancelar', menu.parcela);
                setMenu(null);
              }}
            >
              <ListItemIcon>
                <EventBusyOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Cancelar parcelas
            </MenuItem>
          ),
          <MenuItem
            key="excluir"
            onClick={() => {
              onAcao('excluir', menu.parcela);
              setMenu(null);
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <DeleteOutlineIcon fontSize="small" />
            </ListItemIcon>
            Excluir
          </MenuItem>,
        ]}
      </Menu>
    </SectionCard>
  );
}
