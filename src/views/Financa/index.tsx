import { useState, useMemo, useEffect } from 'react';
import { Typography, Box, Container, MenuItem, Select, FormControl, InputLabel, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TableChartIcon from '@mui/icons-material/TableChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import { CadastroModal } from './CadastroModal';
import { ExclusaoModal } from './ExclusaoModal';
import { GraficoBarras } from './GraficoBarras';
import { Summary } from './Summary';
import { FinancaProvider, useFinanca, Transacao } from '../../contexts/FinancaContext';
import { usePessoa } from '../../contexts/PessoaContext';
import { Alert as CustomAlert } from '../../components/ui/Alert';
import { Card } from '../../components/Card';
import { TabelaTransacao } from './TabelaTransacao';
import { Theme } from '@mui/material/styles';

const MESES = [
  { codigo: '01', descricao: 'Janeiro' },
  { codigo: '02', descricao: 'Fevereiro' },
  { codigo: '03', descricao: 'Março' },
  { codigo: '04', descricao: 'Abril' },
  { codigo: '05', descricao: 'Maio' },
  { codigo: '06', descricao: 'Junho' },
  { codigo: '07', descricao: 'Julho' },
  { codigo: '08', descricao: 'Agosto' },
  { codigo: '09', descricao: 'Setembro' },
  { codigo: '10', descricao: 'Outubro' },
  { codigo: '11', descricao: 'Novembro' },
  { codigo: '12', descricao: 'Dezembro' },
];

export function Financa() {
  const [openCadastroModal, setOpenCadastroModal] = useState(false);
  const [editando, setEditando] = useState<Transacao | null>(null);
  const [excluindo, setExcluindo] = useState<Transacao | null>(null);
  const [anoAtual] = useState(new Date().getFullYear());
  const anos = Array.from({ length: 6 }, (_, i) => {
    const ano = anoAtual + i;
    return { codigo: String(ano), descricao: String(ano) };
  });

  const { pessoa, setPessoa, ano, setAno, mes, setMes, transacoes, cartaoDespesas, excluir, recarregarTransacoes, loading, editar } = useFinanca();
  const { pessoas } = usePessoa();

  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleOpenCadastroModal = () => setOpenCadastroModal(true);
  const handleCloseCadastroModal = () => {
    setOpenCadastroModal(false);
    setEditando(null);
  };

  const handleEditar = (transacao: Transacao) => {
    setEditando(transacao);
    setOpenCadastroModal(true);
  };
  const handleExcluir = (transacao: Transacao) => setExcluindo(transacao);
  const handleCadastroSuccess = () => {
    setSuccessMessage('Transação cadastrada com sucesso!');
    setShowSuccess(true);
  };
  const handleConfirmarExclusao = () => {
    if (excluindo) {
      excluir(excluindo.id);
      setExcluindo(null);
      setTimeout(() => {
        setSuccessMessage('Transação excluída com sucesso!');
        setShowSuccess(true);
        recarregarTransacoes();
      }, 400);
    }
  };

  const handleMarcarComoPaga = (transacao: Transacao) => {
    editar(transacao.id, transacao);
    setSuccessMessage(transacao.paga ? 'Transação marcada como paga!' : 'Transação desmarcada como paga!');
    setShowSuccess(true);
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const transacoesComCartao = useMemo(() => {
    const transacoesArray = Array.isArray(transacoes) ? transacoes : [];
    const totalCartao = (cartaoDespesas || []).reduce((acc, c) => acc + (Number(c.valorParcela) || 0), 0);
    const cartaoLinha = totalCartao > 0 ? [{
      id: `cartao-agrupado-unico-${pessoa}-${ano}-${mes}`,
      tipo: 'despesa' as 'despesa',
      descricao: 'Despesas no cartão de crédito',
      valor: totalCartao,
      data: '',
      fixa: false,
      categoria: 'Despesa',
      pessoa: '',
      ano: '',
      mes: '',
      paga: false,
    }] : [];
    const transacoesOrdenadas = transacoesArray
      .sort((a, b) => {
        if (a.tipo === 'receita' && b.tipo !== 'receita') return -1;
        if (a.tipo !== 'receita' && b.tipo === 'receita') return 1;
        if (a.tipo === 'despesa' && b.tipo === 'despesa') {
          if (a.paga !== b.paga) return a.paga ? 1 : -1;
        }
        const dataA = a.data ? new Date(a.data) : new Date(8640000000000000);
        const dataB = b.data ? new Date(b.data) : new Date(8640000000000000);
        return dataA.getTime() - dataB.getTime();
      })
      .map(t => ({ ...t, categoria: t.categoria || (t.tipo === 'despesa' ? 'Despesa' : 'Receita'), paga: t.paga ?? false }));
    return transacoesOrdenadas.concat(cartaoLinha);
  }, [transacoes, cartaoDespesas, pessoa, ano, mes]);

  const sections = [
    {
      title: 'Resumo Financeiro',
      description: 'Visão geral das receitas e despesas',
      icon: <TrendingUpIcon />,
      component: <Summary />, 
      color: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    },
    {
      title: 'Financeiro',
      description: 'Receitas, despesas e cartões de crédito agrupados',
      icon: <TableChartIcon />,
      component: <TabelaTransacao transacoes={transacoesComCartao} onEditar={handleEditar} onExcluir={handleExcluir} onMarcarComoPaga={handleMarcarComoPaga} loading={loading} />,
      color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    },
    {
      title: 'Gráficos',
      description: 'Análise visual das finanças',
      icon: <BarChartIcon />,
      component: <GraficoBarras />, 
      color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
  ];

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', pb: 6, boxSizing: 'border-box', px: { xs: 1, sm: 3, md: 6 }, mt: 10 }}>
      <Box sx={{ mb: 2, textAlign: 'center', width: '100%' }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 800,
            mb: 1,
            color: '#f5f6fa',
            textShadow: '0 4px 16px rgba(139, 92, 246, 0.3)',
          }}
        >
          Finanças
        </Typography>
      </Box>

      {pessoas.length === 0 && (
        <Box sx={{ mb: 2, color: '#ef4444', fontWeight: 600, textAlign: 'center' }}>
          Nenhuma pessoa encontrada. Cadastre uma pessoa para continuar.
        </Box>
      )}
      <Card 
        sx={{ mb: 3, borderRadius: 0.5, background: (theme: Theme) => theme.palette.background.paper, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', minHeight: 80, width: '100%', maxWidth: '100%' }}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 3,
          flexWrap: { xs: 'nowrap', sm: 'wrap' },
          justifyContent: 'stretch',
          alignItems: 'center',
          width: '100%',
          py: 1,
        }}>
          <FormControl fullWidth size="small" sx={{ maxWidth: 220, bgcolor: '#23263a', borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.2)', '& .MuiInputLabel-root': { color: '#f5f6fa' }, '& .MuiSelect-select': { color: '#f5f6fa' } }}>
            <InputLabel sx={{ color: '#f5f6fa' }}>Pessoa</InputLabel>
            <Select value={pessoa} label="Pessoa" onChange={e => setPessoa(e.target.value)} sx={{ color: '#f5f6fa' }}>
              {pessoas.map(p => <MenuItem key={p.id} value={String(p.id)} sx={{ color: '#f5f6fa' }}>{p.nome}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" sx={{ maxWidth: 120, bgcolor: '#23263a', borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.2)', '& .MuiInputLabel-root': { color: '#f5f6fa' }, '& .MuiSelect-select': { color: '#f5f6fa' } }}>
            <InputLabel sx={{ color: '#f5f6fa' }}>Ano</InputLabel>
            <Select value={ano} label="Ano" onChange={e => setAno(e.target.value)} sx={{ color: '#f5f6fa' }}>
              {anos.map(a => <MenuItem key={a.codigo} value={a.codigo} sx={{ color: '#f5f6fa' }}>{a.descricao}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" sx={{ maxWidth: 120, bgcolor: '#23263a', borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.2)', '& .MuiInputLabel-root': { color: '#f5f6fa' }, '& .MuiSelect-select': { color: '#f5f6fa' } }}>
            <InputLabel sx={{ color: '#f5f6fa' }}>Mês</InputLabel>
            <Select value={mes} label="Mês" onChange={e => setMes(e.target.value)} sx={{ color: '#f5f6fa' }}>
              {MESES.map(m => <MenuItem key={m.codigo} value={m.codigo} sx={{ color: '#f5f6fa' }}>{m.descricao}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Card>

      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3,
        width: '100%',
      }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card
            gradient={'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'}
            sx={{
              mb: 3,
              borderRadius: 0.5,
              background: (theme: Theme) => theme.palette.background.paper,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              width: '100%',
              maxWidth: '100%',
              px: { xs: 1, sm: 4 },
            }}
          >
            <Summary />
          </Card>
          <Card
            gradient={'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}
            sx={{
              mb: 3,
              borderRadius: 0.5,
              background: (theme: Theme) => theme.palette.background.paper,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              width: '100%',
              maxWidth: '100%',
              px: { xs: 1, sm: 4 },
            }}
          >
            <TabelaTransacao transacoes={transacoesComCartao} onEditar={handleEditar} onExcluir={handleExcluir} onMarcarComoPaga={handleMarcarComoPaga} loading={loading} />
          </Card>
        </Box>
        <Box sx={{ flex: 1, minWidth: 350, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card
            gradient={'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}
            sx={{
              mb: 3,
              borderRadius: 0.5,
              background: (theme: Theme) => theme.palette.background.paper,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              width: '100%',
              maxWidth: '100%',
              px: 0,
            }}
          >
            <GraficoBarras />
          </Card>
        </Box>
      </Box>

      <CadastroModal
        open={openCadastroModal}
        onClose={handleCloseCadastroModal}
        transacao={editando}
        onSuccess={handleCadastroSuccess}
      />

      {excluindo && (
        <ExclusaoModal
          key={excluindo.id}
          open={true}
          onClose={() => setExcluindo(null)}
          onConfirm={handleConfirmarExclusao}
          item={excluindo}
        />
      )}

      <Box sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
      }}>
        <Fab
          color="primary"
          aria-label="adicionar transação"
          onClick={handleOpenCadastroModal}
          sx={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
              boxShadow: '0 12px 35px rgba(139, 92, 246, 0.5)',
            },
          }}
        >
          <AddIcon />
        </Fab>
      </Box>

      {showSuccess && (
        <Box sx={{ position: 'fixed', top: 16, left: 0, right: 0, zIndex: 2000, display: 'flex', justifyContent: 'center' }}>
          <CustomAlert onClose={() => setShowSuccess(false)} severity="success">
            {successMessage}
          </CustomAlert>
        </Box>
      )}
    </Box>
  );
}

export { FinancaProvider }; 