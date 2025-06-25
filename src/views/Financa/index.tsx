import { useState, useMemo } from 'react';
import { Paper, Typography, Box, Fab, Icon, Container, Snackbar, Alert, MenuItem, Select, FormControl, InputLabel, Grid, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TableChartIcon from '@mui/icons-material/TableChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { CadastroModal } from './CadastroModal';
import { ExclusaoModal } from './ExclusaoModal';
import { GraficoBarras } from './GraficoBarras';
import { Summary } from './Summary';
import { FinancaProvider, useFinanca, Transacao } from '../../contexts/FinancaContext';
import { usePessoa } from '../../contexts/PessoaContext';

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

// Função utilitária para deixar tudo em maiúsculo
function upper(str: string) {
  return (str || '').toLocaleUpperCase('pt-BR');
}

// Novo componente para resumo por cartão
function CartaoResumo({ onEditar, onExcluir }: { onEditar: (t: Transacao) => void, onExcluir: (t: Transacao) => void }) {
  const { gastosPorCartao, transacoes } = useFinanca();

  // Receitas individuais
  const receitas = (Array.isArray(transacoes) ? transacoes : [])
    .filter(t => t.tipo === 'receita');

  // Despesas normais individuais (não cartão)
  const despesasNormais = (Array.isArray(transacoes) ? transacoes : [])
    .filter(t => t.tipo === 'despesa');

  // Soma total das despesas de cartão
  const totalCartao = Object.values(gastosPorCartao).reduce((acc, v) => acc + (Number(v) || 0), 0);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#333' }}>Resumo Financeiro</Typography>
      <TableContainer sx={{ mt: 2, background: '#fff', borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(90deg, #ff6b6b 0%, #ee5a24 100%)' }}>
              <TableCell sx={{ color: '#fff', fontWeight: 700, borderTopLeftRadius: 12 }}>Tipo</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Data</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Categoria</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Valor</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Linhas de receitas individuais */}
            {receitas.map((r, idx) => (
              <TableRow key={`receita-${idx}`} sx={{ background: idx % 2 === 0 ? '#f8fafd' : '#fff' }}>
                <TableCell sx={{ fontWeight: 500 }}>{upper(r.descricao)}</TableCell>
                <TableCell>{r.data ? (Array.isArray(r.data) ? `${String(r.data[2]).padStart(2, '0')}/${String(r.data[1]).padStart(2, '0')}/${r.data[0]}` : new Date(r.data).toLocaleDateString('pt-BR')) : '-'}</TableCell>
                <TableCell><Chip label={upper('Receita')} size="small" sx={{ backgroundColor: '#2e7d32', color: 'white', fontWeight: 700 }} /></TableCell>
                <TableCell sx={{ color: '#2e7d32', fontWeight: 700 }}>{Number(r.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).toLocaleUpperCase('pt-BR')}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => onEditar(r)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => onExcluir(r)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {/* Linhas de despesas normais individuais */}
            {despesasNormais.map((d, idx) => (
              <TableRow key={`despesa-${idx}`} sx={{ background: idx % 2 === 0 ? '#f8fafd' : '#fff' }}>
                <TableCell sx={{ fontWeight: 500 }}>{upper(d.descricao)}</TableCell>
                <TableCell>{d.data ? (Array.isArray(d.data) ? `${String(d.data[2]).padStart(2, '0')}/${String(d.data[1]).padStart(2, '0')}/${d.data[0]}` : new Date(d.data).toLocaleDateString('pt-BR')) : '-'}</TableCell>
                <TableCell><Chip label={upper('Despesa')} size="small" sx={{ backgroundColor: '#c62828', color: 'white', fontWeight: 700 }} /></TableCell>
                <TableCell sx={{ color: '#c62828', fontWeight: 700 }}>{Number(d.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).toLocaleUpperCase('pt-BR')}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => onEditar(d)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => onExcluir(d)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {/* Linha única para despesas de cartão */}
            {totalCartao > 0 && (
              <TableRow sx={{ background: '#f1f8ff' }}>
                <TableCell sx={{ fontWeight: 500 }}>{upper('Cartão de Crédito')}</TableCell>
                <TableCell>-</TableCell>
                <TableCell><Chip label={upper('Despesa')} size="small" sx={{ backgroundColor: '#c62828', color: 'white', fontWeight: 700 }} /></TableCell>
                <TableCell sx={{ color: '#c62828', fontWeight: 700 }}>{Number(totalCartao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).toLocaleUpperCase('pt-BR')}</TableCell>
                <TableCell />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export function Financa() {
  const [openCadastroModal, setOpenCadastroModal] = useState(false);
  const [editando, setEditando] = useState<Transacao | null>(null);
  const [excluindo, setExcluindo] = useState<Transacao | null>(null);
  const [snack, setSnack] = useState<string | null>(null);
  const [anoAtual] = useState(new Date().getFullYear());
  const anos = Array.from({ length: 6 }, (_, i) => {
    const ano = anoAtual + i;
    return { codigo: String(ano), descricao: String(ano) };
  });

  const { pessoa, setPessoa, ano, setAno, mes, setMes, transacoes, cartaoDespesas, excluir, recarregarTransacoes } = useFinanca();
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
  const handleConfirmarExclusao = () => {
    if (excluindo) {
      excluir(excluindo.id);
      setSnack('Transação excluída com sucesso!');
      setExcluindo(null);
      recarregarTransacoes();
    }
  };

  // Unir transações normais e despesas de cartão adaptadas para a tabela
  const transacoesComCartao = useMemo(() => {
    const transacoesArray = Array.isArray(transacoes) ? transacoes : [];
    const cartaoAdaptado = (cartaoDespesas || []).map((c, idx) => ({
      id: c.id || `cartao-${idx}`,
      tipo: 'despesa' as 'despesa',
      descricao: c.nomeCompra,
      valor: Number(c.valorParcela) || 0,
      data: Array.isArray(c.dataParcela) ? `${c.dataParcela[0]}-${String(c.dataParcela[1]).padStart(2, '0')}-${String(c.dataParcela[2]).padStart(2, '0')}` : '',
      fixa: false,
      categoria: c.nomeCartao || 'Cartão',
      pessoa: '',
      ano: '',
      mes: '',
    }));
    // Cálculo do saldo
    const totalReceitas = transacoesArray.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
    const totalDespesasNormais = transacoesArray.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
    const totalCartao = cartaoAdaptado.reduce((acc, c) => acc + c.valor, 0);
    const saldo = totalReceitas - (totalDespesasNormais + totalCartao);
    let investimentoVirtual: any[] = [];
    if (saldo > 0) {
      investimentoVirtual = [{
        id: 'virtual-investimento',
        tipo: 'despesa',
        descricao: 'Investimento automático (20% do saldo)',
        valor: saldo * 0.2,
        data: '',
        fixa: false,
        categoria: 'Investimento',
        pessoa: '',
        ano: '',
        mes: '',
      }];
    }
    return [
      ...transacoesArray.map(t => ({ ...t, categoria: t.categoria || (t.tipo === 'despesa' ? 'Despesa' : 'Receita') })),
      ...cartaoAdaptado,
      ...investimentoVirtual
    ];
  }, [transacoes, cartaoDespesas]);

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
      component: <CartaoResumo onEditar={handleEditar} onExcluir={handleExcluir} />,
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
        <Paper elevation={1} sx={{ mb: 5, p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.98)', border: '1px solid #e0e7ef', boxShadow: '0 4px 20px rgba(44,62,80,0.06)' }}>
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
        </Paper>

        {/* Grid de seções */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sections.map((section, index) => (
            <Box key={section.title}>
              <Paper
                elevation={0}
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
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Header da seção */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  gap: 2
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: section.color,
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.18)',
                  }}>
                    <Icon sx={{ color: '#ffffff', fontSize: 28 }}>
                      {section.icon}
                    </Icon>
                  </Box>
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: '#2c3e50',
                        mb: 0.5,
                        letterSpacing: 1.1,
                      }}
                    >
                      {section.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#7f8c8d',
                        fontSize: '1rem',
                        fontWeight: 400,
                      }}
                    >
                      {section.description}
                    </Typography>
                  </Box>
                </Box>
                {/* Conteúdo da seção */}
                <Box>
                  {section.component}
                </Box>
              </Paper>
            </Box>
          ))}
        </Box>

        {/* Modal de Cadastro */}
        <CadastroModal
          open={openCadastroModal}
          onClose={handleCloseCadastroModal}
          transacao={editando}
        />

        {/* Modal de Exclusão */}
        <ExclusaoModal
          open={!!excluindo}
          onClose={() => setExcluindo(null)}
          onConfirm={handleConfirmarExclusao}
          item={excluindo}
        />

        {/* Snackbar de feedback */}
        <Snackbar
          open={!!snack}
          autoHideDuration={3000}
          onClose={() => setSnack(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            {snack}
          </Alert>
        </Snackbar>

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
      </Container>
    </Box>
  );
}

export { FinancaProvider }; 