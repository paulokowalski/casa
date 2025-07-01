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
      paga: false,
    }] : [];
    // Não adicionar investimento virtual
    const transacoesOrdenadas = transacoesArray
      .sort((a, b) => {
        if (a.tipo === b.tipo) return 0;
        if (a.tipo === 'receita') return -1;
        return 1;
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
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: 'Financeiro',
      description: 'Receitas, despesas e cartões de crédito agrupados',
      icon: <TableChartIcon />,
      component: <TabelaTransacao transacoes={transacoesComCartao} onEditar={handleEditar} onExcluir={handleExcluir} onMarcarComoPaga={handleMarcarComoPaga} loading={loading} />,
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
        maxWidth="xl"
        sx={{
          py: { xs: 2, md: 4 },
          px: { xs: 1, sm: 2, md: 0 },
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
              color: '#764ba2',
              textShadow: '0 4px 16px rgba(39,26,69,0.18)',
            }}
          >
            Finanças
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#764ba2',
              fontWeight: 400,
              textShadow: '0 2px 8px rgba(39,26,69,0.18)',
            }}
          >
            Subtítulo ou descrição da tela de Finanças
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
          sx={{ mb: 3, p: { xs: 2, md: 3 }, borderRadius: 0.5, background: 'rgba(255,255,255,0.18)', boxShadow: '0 8px 32px rgba(130, 10, 209, 0.18)' }}
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {sections.map((section, idx) => (
            <Card
              key={section.title}
              title={section.title}
              description={section.description}
              icon={section.icon}
              gradient={section.color}
              sx={{ mb: 3, borderRadius: 0.5, background: 'rgba(255,255,255,0.18)', boxShadow: '0 8px 32px rgba(130, 10, 209, 0.18)' }}
              className="fade-in-up"
            >
              {section.component}
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

        {/* Alerta fixo de feedback, sem animação */}
        {showSuccess && (
          <Box sx={{ position: 'fixed', top: 16, left: 0, right: 0, zIndex: 2000, display: 'flex', justifyContent: 'center' }}>
            <CustomAlert onClose={() => setShowSuccess(false)} severity="success">
              {successMessage}
            </CustomAlert>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export { FinancaProvider }; 