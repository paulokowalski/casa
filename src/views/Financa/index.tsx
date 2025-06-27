import { useState, useMemo } from 'react';
import { Typography, Box, Fab, Container, Snackbar, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
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
import MuiAlert from '@mui/material/Alert';

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
  const [snack, setSnack] = useState<string | null>(null);
  const [snackType, setSnackType] = useState<'success' | 'info'>('info');
  const [anoAtual] = useState(new Date().getFullYear());
  const anos = Array.from({ length: 6 }, (_, i) => {
    const ano = anoAtual + i;
    return { codigo: String(ano), descricao: String(ano) };
  });

  const { pessoa, setPessoa, ano, setAno, mes, setMes, transacoes, cartaoDespesas, excluir, recarregarTransacoes, loading } = useFinanca();
  const { pessoas } = usePessoa();

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
    setSnack('Transação cadastrada com sucesso!');
    setSnackType('success');
  };
  const handleConfirmarExclusao = () => {
    if (excluindo) {
      excluir(excluindo.id);
      setExcluindo(null);
      setTimeout(() => {
        setSnack('Transação excluída com sucesso!');
        setSnackType('info');
        recarregarTransacoes();
      }, 400);
    }
  };

  // Unir transações normais e despesas de cartão adaptadas para a tabela
  const transacoesComCartao = useMemo(() => {
    const transacoesArray = Array.isArray(transacoes) ? transacoes : [];
    // Somar todas as despesas de cartão
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
    }] : [];
    // Não adicionar investimento virtual
    return [
      ...transacoesArray.map(t => ({ ...t, categoria: t.categoria || (t.tipo === 'despesa' ? 'Despesa' : 'Receita') })),
      ...cartaoLinha
    ];
  }, [transacoes, cartaoDespesas, pessoa, ano, mes]);

  const sections = [
    {
      title: 'Resumo Financeiro',
      description: 'Visão geral das receitas e despesas',
      icon: <TrendingUpIcon />,
      component: <Summary />, 
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: 'Financeiro',
      description: 'Receitas, despesas e cartões de crédito agrupados',
      icon: <TableChartIcon />,
      component: <TabelaTransacao transacoes={transacoesComCartao} onEditar={handleEditar} onExcluir={handleExcluir} loading={loading} />,
      color: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    },
    {
      title: 'Gráficos',
      description: 'Análise visual das finanças',
      icon: <BarChartIcon />,
      component: <GraficoBarras />, 
      color: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
    },
  ];

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', pb: 6 }}>
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 4, md: 6 },
          px: { xs: 2, sm: 4, md: 0 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          width: '100%',
          maxWidth: '100vw',
          boxSizing: 'border-box',
        }}
      >
        {/* Header da página */}
        <Box sx={{ mb: 4, textAlign: 'center' }} className="fade-in">
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800,
              mb: 1,
              color: '#ffffff',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
          >
            Finanças
          </Typography>
        </Box>

        {/* Selects de pessoa, ano e mês */}
        {pessoas.length === 0 && (
          <Box sx={{ mb: 2, color: 'red', fontWeight: 600, textAlign: 'center' }}>
            Nenhuma pessoa encontrada. Cadastre uma pessoa para continuar.
          </Box>
        )}
        <Card 
          title="Filtros"
          description="Selecione pessoa, ano e mês para filtrar"
          icon={<TableChartIcon />} 
          sx={{ mb: 5, p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.98)', border: '1px solid #e0e7ef', boxShadow: '0 4px 20px rgba(44,62,80,0.06)' }}
        >
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            <FormControl fullWidth size="small" sx={{ maxWidth: 220, bgcolor: 'white', borderRadius: 2, boxShadow: '0 1px 6px rgba(44,62,80,0.04)' }}>
              <InputLabel>Pessoa</InputLabel>
              <Select value={pessoa} label="Pessoa" onChange={e => setPessoa(e.target.value)}>
                {pessoas.map(p => <MenuItem key={p.id} value={String(p.id)}>{p.nome}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" sx={{ maxWidth: 120, bgcolor: 'white', borderRadius: 2, boxShadow: '0 1px 6px rgba(44,62,80,0.04)' }}>
              <InputLabel>Ano</InputLabel>
              <Select value={ano} label="Ano" onChange={e => setAno(e.target.value)}>
                {anos.map(a => <MenuItem key={a.codigo} value={a.codigo}>{a.descricao}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" sx={{ maxWidth: 120, bgcolor: 'white', borderRadius: 2, boxShadow: '0 1px 6px rgba(44,62,80,0.04)' }}>
              <InputLabel>Mês</InputLabel>
              <Select value={mes} label="Mês" onChange={e => setMes(e.target.value)}>
                {MESES.map(m => <MenuItem key={m.codigo} value={m.codigo}>{m.descricao}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </Card>

        {/* Grid de seções */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sections.map((section, index) => (
            <Card
              key={section.title || index}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.98)',
                border: '1px solid #e0e7ef',
                boxShadow: '0 6px 32px rgba(44,62,80,0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(44,62,80,0.10)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: section.color,
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                },
              }}
              className="fade-in-up"
              title={section.title}
              description={section.description}
              icon={section.icon}
              gradient={section.color}
            >
              <Box>
                {section.component}
              </Box>
            </Card>
          ))}
        </Box>

        {/* Modal de Cadastro */}
        <CadastroModal
          open={openCadastroModal}
          onClose={handleCloseCadastroModal}
          transacao={editando}
          onSuccess={handleCadastroSuccess}
        />

        {/* Modal de Exclusão */}
        {excluindo && (
          <ExclusaoModal
            key={excluindo.id}
            open={true}
            onClose={() => setExcluindo(null)}
            onConfirm={handleConfirmarExclusao}
            item={excluindo}
          />
        )}

        {/* FAB Moderno */}
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
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
            }}
          >
            <AddIcon />
          </Fab>
        </Box>

        {/* Snackbar de feedback */}
        <Snackbar
          open={!!snack}
          autoHideDuration={3000}
          onClose={() => setSnack(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <MuiAlert onClose={() => setSnack(null)} severity={snackType} sx={{ width: '100%', background: snackType === 'success' ? '#e8f5e9' : '#e3f2fd', color: snackType === 'success' ? '#2e7d32' : '#1565c0' }}>
            {snack}
          </MuiAlert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export { FinancaProvider }; 