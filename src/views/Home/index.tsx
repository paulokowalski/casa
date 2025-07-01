import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Chip, Stack, Tooltip, Container, Paper } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EuroIcon from '@mui/icons-material/Euro';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// Componentes profissionais
import { LoadingCard } from '../../components/ui/LoadingCard';
import { ErrorCard } from '../../components/ui/ErrorCard';
import { Card } from '../../components/Card';

// Configurações
import { API_URLS } from '../../config/urls';
import { useCearaData, useFipeData, useCurrencyData } from '../../hooks/useApiData';
import { useFinanca } from '../../contexts/FinancaContext';
import { DESIGN_CONFIG } from '../../config/constants';

function CearaTableCard() {
  const { data, loading, error, refetch } = useCearaData(API_URLS.CEARA);

  if (loading === 'loading') {
    return <LoadingCard title="Ceará" variant="detailed" />;
  }

  if (error) {
    return <ErrorCard error={error} onRetry={refetch} title="Erro ao carregar dados do Ceará" />;
  }

  if (!data) {
    return <ErrorCard error="Nenhum dado disponível" title="Dados não encontrados" />;
  }

  return (
    <Card
      title="Ceará"
      description="Brasileirão 2025"
      icon={<SportsSoccerIcon />}
      gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      badge={`${data.intPoints} pts`}
      badgeColor="success"
    >
      <Box sx={{ textAlign: 'center', py: 0.5 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.2, fontSize: '0.85rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {data.intRank}º lugar
        </Typography>
        <Typography variant="caption" color="#7f8c8d" sx={{ mb: 0.2, fontSize: '0.65rem' }}>
          Posição na tabela
        </Typography>
        <Stack direction="row" spacing={0.3} justifyContent="center" flexWrap="wrap" useFlexGap>
          <Chip label={`J: ${data.intPlayed}`} size="small" sx={{ fontSize: '0.65rem', height: 16, px: 0.5, background: 'rgba(255,255,255,0.2)', color: '#2c3e50', fontWeight: 600 }} />
          <Chip label={`V: ${data.intWin}`} size="small" sx={{ fontSize: '0.65rem', height: 16, px: 0.5, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#fff', fontWeight: 600 }} />
          <Chip label={`E: ${data.intDraw}`} size="small" sx={{ fontSize: '0.65rem', height: 16, px: 0.5, background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)', color: '#fff', fontWeight: 600 }} />
          <Chip label={`D: ${data.intLoss}`} size="small" sx={{ fontSize: '0.65rem', height: 16, px: 0.5, background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', color: '#fff', fontWeight: 600 }} />
        </Stack>
      </Box>
    </Card>
  );
}

function CarFipeCard() {
  const { data, loading, error, refetch } = useFipeData(API_URLS.FIPE);

  if (loading === 'loading') {
    return <LoadingCard title="Valor FIPE" variant="detailed" />;
  }

  if (error) {
    return <ErrorCard error={error} onRetry={refetch} title="Erro ao carregar dados da FIPE" />;
  }

  if (!data) {
    return <ErrorCard error="Nenhum dado disponível" title="Dados não encontrados" />;
  }

  return (
    <Card
      title={`${data.brand} ${data.model}`}
      description={`Ano ${data.modelYear} • ${data.fuel}`}
      icon={<DirectionsCarIcon />}
      gradient="linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)"
      badge="FIPE"
      badgeColor="info"
    >
      <Box sx={{ textAlign: 'center', py: 0.5 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.2, fontSize: '0.85rem', background: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {data.price}
        </Typography>
        <Typography variant="caption" color="#7f8c8d" sx={{ mb: 0.2, fontSize: '0.65rem' }}>
          Valor FIPE ({data.referenceMonth})
        </Typography>
        <Chip label={`Código: ${data.codeFipe}`} sx={{ fontSize: '0.65rem', height: 16, px: 0.5, background: 'rgba(255,255,255,0.2)', color: '#2c3e50', fontWeight: 600, mb: 0.5 }} />
        <Box display="flex" justifyContent="center">
          <a href={`https://www.webmotors.com.br/carros-usados/${encodeURIComponent(data.brand.split(' - ')[1] || data.brand)}/${encodeURIComponent(data.model.split(' ')[0])}?ano=${data.modelYear}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <Chip label="Ver no Mercado" sx={{ fontSize: '0.65rem', height: 16, px: 0.5, background: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)', color: '#fff', fontWeight: 600, cursor: 'pointer', '&:hover': { transform: 'scale(1.05)' }, transition: 'transform 0.3s ease' }} />
          </a>
        </Box>
      </Box>
    </Card>
  );
}

function CurrencyCard({ url, icon, label, gradient }: { url: string; icon: React.ReactNode; label: string; gradient: string }) {
  const { data, loading, error, refetch } = useCurrencyData(url);

  if (loading === 'loading') {
    return <LoadingCard title={label} variant="compact" height={DESIGN_CONFIG.COMPACT_CARD_HEIGHT} />;
  }

  if (error) {
    return <ErrorCard error={error} onRetry={refetch} title={`Erro ao carregar ${label}`} variant="compact" />;
  }

  if (!data) {
    return <ErrorCard error="Nenhum dado disponível" title="Dados não encontrados" variant="compact" />;
  }

  return (
    <Card
      title={label}
      description="Cotação atual"
      icon={icon}
      gradient={gradient}
    >
      <Box sx={{ textAlign: 'center', py: 0.5 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.2, fontSize: '0.85rem', background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          R$ {Number(data.bid).toLocaleString('pt-BR', { minimumFractionDigits: 4 })}
        </Typography>
        <Typography variant="caption" color="#7f8c8d" sx={{ fontSize: '0.65rem' }}>
          Compra • Venda: R$ {Number(data.ask).toLocaleString('pt-BR', { minimumFractionDigits: 4 })}
        </Typography>
      </Box>
    </Card>
  );
}

function DespesasVencerCard() {
  const { getDespesasProximasTodasPessoas } = useFinanca();
  const [qtd, setQtd] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    getDespesasProximasTodasPessoas().then(despesas => {
      // Filtrar só as que vencem em até 30 dias e NÃO estão pagas
      const hoje = new Date();
      const proximas30 = despesas.filter((t: any) => {
        if (t.paga) return false; // só não pagas!
        const dataVenc = Array.isArray(t.data)
          ? new Date(t.data[0], t.data[1] - 1, t.data[2])
          : new Date(t.data);
        const diff = (dataVenc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 30;
      });
      setQtd(proximas30.length);
      setLoading(false);
    });
  }, [getDespesasProximasTodasPessoas]);
  return (
    <Card
      title="Despesas a vencer"
      description="Próximos 30 dias"
      icon={<WarningAmberIcon />}
      gradient="linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)"
      badge={qtd > 0 ? `${qtd}` : undefined}
      badgeColor={qtd > 0 ? 'error' : 'info'}
    >
      <Box sx={{ textAlign: 'center', py: 0.5 }}>
        {loading ? (
          <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>Carregando...</Typography>
        ) : qtd > 0 ? (
          <Typography variant="subtitle2" color="error" fontWeight={700} sx={{ fontSize: '0.85rem' }}>{qtd} despesa{qtd > 1 ? 's' : ''} a vencer</Typography>
        ) : (
          <Typography variant="caption" color="success.main" sx={{ fontSize: '0.65rem' }}>Nenhuma despesa a vencer nos próximos 30 dias.</Typography>
        )}
      </Box>
    </Card>
  );
}

// Novo componente para card compacto e informativo
function DashboardInfoCard({ icon, title, value, loading, error, label }: {
  icon: React.ReactNode,
  title: string,
  value: React.ReactNode,
  loading?: boolean,
  error?: boolean,
  label?: string
}) {
  return (
    <Paper sx={{
      display: 'flex',
      alignItems: 'flex-start',
      minWidth: 180,
      maxWidth: 240,
      px: 2,
      py: 1.2,
      borderRadius: 2,
      boxShadow: '0 2px 8px rgba(130, 10, 209, 0.10)',
      background: 'rgba(255,255,255,0.95)',
      border: '1px solid #eee',
      flex: '0 0 auto',
      gap: 1.5,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 36, pt: 0.5 }}>{icon}</Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '1rem', mb: 0.2 }}>{title}</Typography>
        {loading ? (
          <Typography variant="caption" color="text.secondary">Carregando...</Typography>
        ) : error ? (
          <Typography variant="caption" color="error">Erro</Typography>
        ) : (
          <Box sx={{ width: '100%' }}>{label} {value}</Box>
        )}
      </Box>
    </Paper>
  );
}

export function Home() {
  // Hooks para dados reais
  const { data: cearaData, loading: cearaLoading, error: cearaError } = useCearaData(API_URLS.CEARA);
  const { data: fipeData, loading: fipeLoading, error: fipeError } = useFipeData(API_URLS.FIPE);
  const { data: dollarData, loading: dollarLoading, error: dollarError } = useCurrencyData(API_URLS.DOLLAR);
  const { data: euroData, loading: euroLoading, error: euroError } = useCurrencyData(API_URLS.EURO);
  const { getDespesasProximasTodasPessoas } = useFinanca();
  const [qtdDespesas, setQtdDespesas] = React.useState<number | null>(null);
  const [qtdLoading, setQtdLoading] = React.useState(true);
  React.useEffect(() => {
    setQtdLoading(true);
    getDespesasProximasTodasPessoas().then(despesas => {
      const hoje = new Date();
      const proximas30 = despesas.filter((t: any) => {
        if (t.paga) return false;
        const dataVenc = Array.isArray(t.data)
          ? new Date(t.data[0], t.data[1] - 1, t.data[2])
          : new Date(t.data);
        const diff = (dataVenc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 30;
      });
      setQtdDespesas(proximas30.length);
      setQtdLoading(false);
    });
  }, [getDespesasProximasTodasPessoas]);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
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
          Dashboard Kowalski House
        </Typography>
      </Box>
      <Typography 
        variant="h6" 
        sx={{ 
          color: '#764ba2',
          fontWeight: 400,
          textShadow: '0 2px 8px rgba(39,26,69,0.18)',
          textAlign: 'center',
          mb: 3
        }}
      >
        Informações em tempo real e insights inteligentes
      </Typography>
      {/* Novo layout: cards em linha única com rolagem horizontal no mobile, grid no desktop */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'row', md: 'row' },
        overflowX: { xs: 'auto', md: 'visible' },
        gap: 2,
        pb: 2,
        flexWrap: { xs: 'nowrap', md: 'wrap' },
        justifyContent: { xs: 'flex-start', md: 'center' },
      }}>
        <DashboardInfoCard
          icon={<SportsSoccerIcon sx={{ color: '#667eea', fontSize: 28 }} />}
          title="Ceará"
          value={cearaData ? (
            <Box>
              <Typography variant="caption" color="text.secondary">Posição: {cearaData.intRank}º</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Pontos: {cearaData.intPoints}</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap', maxWidth: 180 }}>
                <Chip label={`J: ${cearaData.intPlayed}`} size="small" sx={{ fontSize: '0.65rem', height: 16, px: 0.5, background: 'rgba(255,255,255,0.2)', color: '#2c3e50', fontWeight: 600 }} />
                <Chip label={`V: ${cearaData.intWin}`} size="small" sx={{ fontSize: '0.65rem', height: 16, px: 0.5, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#fff', fontWeight: 600 }} />
                <Chip label={`E: ${cearaData.intDraw}`} size="small" sx={{ fontSize: '0.65rem', height: 16, px: 0.5, background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)', color: '#fff', fontWeight: 600 }} />
                <Chip label={`D: ${cearaData.intLoss}`} size="small" sx={{ fontSize: '0.65rem', height: 16, px: 0.5, background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', color: '#fff', fontWeight: 600 }} />
              </Box>
            </Box>
          ) : '--'}
          loading={cearaLoading === 'loading'}
          error={!!cearaError}
          label=""
        />
        <DashboardInfoCard
          icon={<DirectionsCarIcon sx={{ color: '#36d1dc', fontSize: 28 }} />}
          title={fipeData ? `${fipeData.brand} ${fipeData.model}` : 'FIPE'}
          value={fipeData ? fipeData.price : '--'}
          loading={fipeLoading === 'loading'}
          error={!!fipeError}
          label="Valor:"
        />
        <DashboardInfoCard
          icon={<AttachMoneyIcon sx={{ color: '#4facfe', fontSize: 28 }} />}
          title="Dólar"
          value={dollarData ? `R$ ${Number(dollarData.bid).toLocaleString('pt-BR', { minimumFractionDigits: 4 })}` : '--'}
          loading={dollarLoading === 'loading'}
          error={!!dollarError}
          label=""
        />
        <DashboardInfoCard
          icon={<EuroIcon sx={{ color: '#feca57', fontSize: 28 }} />}
          title="Euro"
          value={euroData ? `R$ ${Number(euroData.bid).toLocaleString('pt-BR', { minimumFractionDigits: 4 })}` : '--'}
          loading={euroLoading === 'loading'}
          error={!!euroError}
          label=""
        />
        <DashboardInfoCard
          icon={<WarningAmberIcon sx={{ color: '#ff6b6b', fontSize: 28 }} />}
          title="Despesas a vencer"
          value={qtdDespesas !== null ? qtdDespesas : '--'}
          loading={qtdLoading}
          error={false}
          label="Qtd:"
        />
      </Box>
    </Container>
  );
}