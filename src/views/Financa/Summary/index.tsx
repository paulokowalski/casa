import { Box, Paper, Typography } from '@mui/material';
import { useFinanca } from '../../../contexts/FinancaContext';

export function Summary() {
  const { transacoes, gastosPorCartao, cartaoDespesas } = useFinanca();
  const transacoesArray = Array.isArray(transacoes) ? transacoes : [];
  const totalReceitas = transacoesArray.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
  const totalDespesasNormais = transacoesArray.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
  const totalCartao = (cartaoDespesas || []).reduce((acc, c) => acc + (Number(c.valorParcela) || 0), 0);
  const totalDespesas = totalDespesasNormais + totalCartao;
  const saldo = totalReceitas - totalDespesas;
  const valorInvestir = saldo > 0 ? saldo * 0.2 : 0;
  const saldoAposInvestir = saldo > 0 ? saldo - valorInvestir : saldo;

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'nowrap', overflowX: 'auto', pb: 1 }}>
      <Paper sx={{ p: 2, minWidth: 200 }}>
        <Typography variant="subtitle2">Receitas</Typography>
        <Typography variant="h6" color="success.main">{totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
      </Paper>
      <Paper sx={{ p: 2, minWidth: 200 }}>
        <Typography variant="subtitle2">Despesas</Typography>
        <Typography variant="h6" color="error.main">{totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
      </Paper>
      <Paper sx={{ p: 2, minWidth: 200 }}>
        <Typography variant="subtitle2">Saldo</Typography>
        <Typography variant="h6" color={saldo >= 0 ? 'success.main' : 'error.main'}>{saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
      </Paper>
      <Paper sx={{ p: 2, minWidth: 200, background: '#e3fcec' }}>
        <Typography variant="subtitle2">Investimento Sugerido (20%)</Typography>
        <Typography variant="h6" color="primary.main">{valorInvestir.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
        <Typography variant="caption" color="text.secondary">Invista 20% do saldo positivo do mês</Typography>
      </Paper>
      <Paper sx={{ p: 2, minWidth: 200, background: '#f0f4ff' }}>
        <Typography variant="subtitle2">Saldo Após Investir</Typography>
        <Typography variant="h6" color={saldoAposInvestir >= 0 ? 'success.main' : 'error.main'}>{saldoAposInvestir.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
        <Typography variant="caption" color="text.secondary">Saldo disponível após investir 20%</Typography>
      </Paper>
    </Box>
  );
} 