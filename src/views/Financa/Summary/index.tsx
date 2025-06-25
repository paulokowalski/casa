import { Box, Typography } from '@mui/material';
import { useFinanca } from '../../../contexts/FinancaContext';
import { Card } from '../../../components/Card';
import { LoadingCard } from '../../../components/ui/LoadingCard';

export function Summary() {
  const { transacoes, gastosPorCartao, cartaoDespesas, loading } = useFinanca();
  const transacoesArray = Array.isArray(transacoes) ? transacoes : [];
  const totalReceitas = transacoesArray.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
  const totalDespesasNormais = transacoesArray.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
  const totalCartao = (cartaoDespesas || []).reduce((acc, c) => acc + (Number(c.valorParcela) || 0), 0);
  const totalDespesas = totalDespesasNormais + totalCartao;
  const saldo = totalReceitas - totalDespesas;
  const valorInvestir = saldo > 0 ? saldo * 0.3 : 0;
  const saldoAposInvestir = saldo > 0 ? saldo - valorInvestir : saldo;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'nowrap', overflowX: 'auto', pb: 1 }}>
        <LoadingCard title="Receitas" variant="compact" />
        <LoadingCard title="Despesas" variant="compact" />
        <LoadingCard title="Saldo" variant="compact" />
        <LoadingCard title="Investimento Sugerido (30%)" variant="compact" />
        <LoadingCard title="Saldo Após Investir" variant="compact" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'nowrap', overflowX: 'auto', pb: 1 }}>
      <Card title="Receitas">
        <Typography variant="subtitle2">Receitas</Typography>
        <Typography variant="h6" color="success.main">{totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
      </Card>
      <Card title="Despesas">
        <Typography variant="subtitle2">Despesas</Typography>
        <Typography variant="h6" color="error.main">{totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
      </Card>
      <Card title="Saldo">
        <Typography variant="subtitle2">Saldo</Typography>
        <Typography variant="h6" color={saldo >= 0 ? 'success.main' : 'error.main'}>{saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
      </Card>
      <Card title="Investimento Sugerido (30%)">
        <Typography variant="subtitle2">Investimento Sugerido (30%)</Typography>
        <Typography variant="h6" color="primary.main">{valorInvestir.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
        <Typography variant="caption" color="text.secondary">Invista 30% do saldo positivo do mês</Typography>
      </Card>
      <Card title="Saldo Após Investir">
        <Typography variant="subtitle2">Saldo Após Investir</Typography>
        <Typography variant="h6" color={saldoAposInvestir >= 0 ? 'success.main' : 'error.main'}>{saldoAposInvestir.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
        <Typography variant="caption" color="text.secondary">Saldo disponível após investir 30%</Typography>
      </Card>
    </Box>
  );
} 