import { Box, Typography, IconButton, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Transacao as TransacaoBase } from '../../../contexts/FinancaContext';
import { Table } from '../../../components/ui/Table';
import { LoadingOverlay } from '../../../components/ui/LoadingOverlay';
import { formatCurrency } from '../../../functions/global';

type Transacao = TransacaoBase;

interface TabelaTransacaoProps {
  transacoes: Transacao[];
  onEditar: (transacao: Transacao) => void;
  onExcluir: (transacao: Transacao) => void;
  onMarcarComoPaga: (transacao: Transacao) => void;
  loading?: boolean;
}

export function TabelaTransacao({ transacoes, onEditar, onExcluir, onMarcarComoPaga, loading = false }: TabelaTransacaoProps) {
  const columns = [
    { id: 'descricao', label: 'Descrição' },
    {
      id: 'valor',
      label: 'Valor',
      render: (value: Transacao['valor']) => value !== undefined && value !== null ? formatCurrency(value) : '',
    },
    {
      id: 'data',
      label: 'Data',
      render: (value: Transacao['data']) => {
        if (!value) return '';
        // Espera yyyy-MM-dd ou yyyy-MM-ddTHH:mm:ss
        const match = String(value).match(/(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
          return `${match[3]}/${match[2]}/${match[1]}`;
        }
        // Se vier timestamp ou outro formato
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('pt-BR');
        }
        return value;
      },
    },
    {
      id: 'fixa',
      label: 'Fixa?',
      render: (value: Transacao['fixa']) => (value ? 'Sim' : 'Não'),
    },
    {
      id: 'categoria',
      label: 'Categoria',
      render: (value: Transacao['categoria']) => {
        let color: 'default' | 'error' | 'success' | 'primary' = 'default';
        if (value === 'Despesa') color = 'error';
        else if (value === 'Receita') color = 'success';
        else if (value === 'Investimento') color = 'primary';
        return <Chip label={value} color={color} size="small" variant="outlined" />;
      },
    },
    {
      id: 'acoes',
      label: 'Ações',
      align: 'right' as const,
      render: (_: undefined, row: Transacao) => {
        // Não exibir ações para a linha de despesas de cartão de crédito agrupada
        if (row.categoria === 'Despesa' && row.descricao === 'Despesas no cartão de crédito') {
          return null;
        }
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={() => onEditar(row)}><EditIcon fontSize="small" /></IconButton>
            <IconButton size="small" color="error" onClick={() => onExcluir(row)}><DeleteIcon fontSize="small" /></IconButton>
            {row.tipo === 'despesa' && (
              <IconButton
                size="small"
                color={row.paga ? "success" : "default"}
                onClick={() => onMarcarComoPaga({ ...row, paga: !row.paga })}
                title={row.paga ? "Desmarcar como paga" : "Marcar como paga"}
              >
                {row.paga
                  ? <CheckCircleIcon fontSize="small" />
                  : <RadioButtonUncheckedIcon fontSize="small" />
                }
              </IconButton>
            )}
            {row.paga && row.tipo === 'despesa' && (
              <span style={{ color: '#2e7d32', fontWeight: 600, marginLeft: 8 }}>Paga</span>
            )}
          </Box>
        );
      },
    },
  ];

  // Exemplo: simular loading (substitua por prop real do seu contexto)
  const isLoading = false; // Troque para true para testar o efeito

  const data = transacoes;

  return (
    <Box>
      <Typography variant="h6">Tabela de Despesas e Receitas</Typography>
      <LoadingOverlay loading={loading}>
        <Table<Transacao> columns={columns} data={data} emptyMessage="Nenhuma transação encontrada."
          rowsPerPageOptions={[5, 10, 25]}
          defaultRowsPerPage={10}
        />
      </LoadingOverlay>
    </Box>
  );
} 