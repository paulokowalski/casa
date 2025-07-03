import { Box, Typography } from '@mui/material';
import { useFinanca } from '../../../contexts/FinancaContext';
import { Card } from '../../../components/Card';
import { LoadingCard } from '../../../components/ui/LoadingCard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaymentIcon from '@mui/icons-material/Payment';
import { formatCurrency } from '../../../functions/global';

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

  const summaryItems = [
    {
      title: 'Receitas',
      value: formatCurrency(totalReceitas),
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      icon: <TrendingUpIcon />,
      description: 'Total de receitas do mês',
      trend: 'up',
    },
    {
      title: 'Despesas',
      value: formatCurrency(totalDespesas),
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      icon: <TrendingDownIcon />,
      description: 'Total de despesas do mês',
      trend: 'down',
    },
    {
      title: 'Saldo',
      value: formatCurrency(saldo),
      color: saldo >= 0 ? '#10b981' : '#ef4444',
      gradient: saldo >= 0
        ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
        : 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      icon: <AccountBalanceWalletIcon />,
      description: 'Saldo do mês',
      trend: saldo >= 0 ? 'up' : 'down',
    },
    {
      title: 'Investimento Sugerido (30%)',
      value: formatCurrency(valorInvestir),
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: <PaymentIcon />,
      description: 'Invista 30% do saldo positivo do mês',
      trend: 'up',
    },
    {
      title: 'Saldo Após Investir',
      value: formatCurrency(saldoAposInvestir),
      color: saldoAposInvestir >= 0 ? '#10b981' : '#ef4444',
      gradient: saldoAposInvestir >= 0
        ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
        : 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      icon: <CalendarTodayIcon />,
      description: 'Saldo disponível após investir 30%',
      trend: saldoAposInvestir >= 0 ? 'up' : 'down',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(5, 1fr)'
        },
        gap: { xs: 2, md: 3 },
        width: '100%',
      }}>
        <LoadingCard title="Receitas" variant="compact" />
        <LoadingCard title="Despesas" variant="compact" />
        <LoadingCard title="Saldo" variant="compact" />
        <LoadingCard title="Investimento Sugerido (30%)" variant="compact" />
        <LoadingCard title="Saldo Após Investir" variant="compact" />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(5, 1fr)'
      },
      gap: { xs: 2, md: 3 },
      width: '100%',
    }}>
      {summaryItems.map((item, index) => (
        <Card
          key={index}
          gradient={item.gradient}
          className="fade-in-up"
        >
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <span style={{ display: 'flex', alignItems: 'center', color: item.color, fontSize: 18 }}>{item.icon}</span>
              <Typography variant="subtitle2" sx={{ color: item.color, fontWeight: 500, fontSize: '0.95rem', opacity: 0.85 }}>
                {item.title}
              </Typography>
            </Box>
            <Typography 
              variant="h4" 
              component="p" 
              sx={{ 
                color: item.color,
                fontWeight: 700,
                mb: 1,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                background: item.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {item.value}
            </Typography>
            <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {item.trend === "up" ? (
                <TrendingUpIcon sx={{ color: '#4facfe', fontSize: 14, transform: 'rotate(-45deg)' }} />
              ) : (
                <TrendingDownIcon sx={{ color: '#ff6b6b', fontSize: 14, transform: 'rotate(45deg)' }} />
              )}
            </Box>
          </Box>
        </Card>
      ))}
    </Box>
  );
} 