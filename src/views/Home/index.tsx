import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Chip, Stack, Tooltip, Container, Paper } from '@mui/material';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EuroSymbolIcon from '@mui/icons-material/EuroSymbol';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';

// Componentes profissionais
import { LoadingCard } from '../../components/ui/LoadingCard';
import { ErrorCard } from '../../components/ui/ErrorCard';
import { Card } from '../../components/Card';

// Configurações
import { API_URLS } from '../../config/urls';
import { useCearaData, useFipeData, useCurrencyData, useBitcoinPrice } from '../../hooks/useApiData';
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
      icon={<DirectionsCarFilledIcon />}
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
      icon={<CalendarMonthIcon />}
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
  const { data: bitcoinData, loading: bitcoinLoading, error: bitcoinError } = useBitcoinPrice();
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
    <Box sx={{ minHeight: '100vh', background: theme => theme.palette.background.default, py: 0 }}>
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
        {/* Header da página */}
        <Box sx={{ mt: 6, mb: 6, textAlign: 'center' }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 900,
              mb: 2,
              color: theme => theme.palette.primary.main,
              textShadow: '0 6px 24px rgba(39,26,69,0.10)',
              letterSpacing: 1.5,
              fontFamily: 'Manrope, Inter, Roboto, Arial, sans-serif',
            }}
          >
            Dashboard
          </Typography>
        </Box>
        {/* Grid responsivo de cards padrão do sistema */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 5,
          justifyContent: 'center',
          alignItems: 'stretch',
          pb: 2,
        }}>
          {/* Card Ceará */}
          {cearaLoading === 'loading' ? (
            <LoadingCard title="Ceará" variant="detailed" />
          ) : cearaError ? (
            <ErrorCard error={cearaError} title="Erro ao carregar dados do Ceará" />
          ) : cearaData ? (
            <Card gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  {cearaData && cearaData.strBadge ? (
                    <img src={cearaData.strBadge} alt="Escudo Ceará" style={{ width: 22, height: 22, objectFit: 'contain', display: 'block' }} />
                  ) : (
                    <SportsSoccerIcon sx={{ fontSize: 20, color: '#667eea' }} />
                  )}
                  <Typography variant="subtitle2" sx={{ color: '#667eea', fontWeight: 600, fontSize: '0.95rem', opacity: 0.85 }}>
                    Ceará
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#667eea', fontWeight: 800, fontSize: { xs: '1.35rem', md: '1.7rem' }, mb: 0 }}>{cearaData.intRank}º</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>Pontos: <b>{cearaData.intPoints}</b> • Jogos: <b>{cearaData.intPlayed}</b></Typography>
              </Box>
            </Card>
          ) : null}

          {/* Card FIPE */}
          {fipeLoading === 'loading' ? (
            <LoadingCard title="Valor FIPE" variant="detailed" />
          ) : fipeError ? (
            <ErrorCard error={fipeError} title="Erro ao carregar dados da FIPE" />
          ) : fipeData ? (
            <Card gradient="linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)">
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <DirectionsCarFilledIcon sx={{ fontSize: 20, color: '#36d1dc' }} />
                  <Typography variant="subtitle2" sx={{ color: '#36d1dc', fontWeight: 600, fontSize: '0.95rem', opacity: 0.85 }}>
                    {fipeData.brand} {fipeData.model}
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#36d1dc', fontWeight: 800, fontSize: { xs: '1.35rem', md: '1.7rem' }, mb: 0 }}>{fipeData.price}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>Ano {fipeData.modelYear} • {fipeData.fuel}</Typography>
              </Box>
            </Card>
          ) : null}

          {/* Card Despesas a vencer */}
          {qtdLoading ? (
            <LoadingCard title="Despesas a vencer" variant="detailed" />
          ) : qtdDespesas !== null ? (
            <Card gradient="linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)">
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <CalendarMonthIcon sx={{ fontSize: 20, color: '#ff6b6b' }} />
                  <Typography variant="subtitle2" sx={{ color: '#ff6b6b', fontWeight: 600, fontSize: '0.95rem', opacity: 0.85 }}>
                    Despesas a vencer
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#ff6b6b', fontWeight: 800, fontSize: { xs: '1.35rem', md: '1.7rem' }, mb: 0 }}>{qtdDespesas}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>Próximos 30 dias</Typography>
              </Box>
            </Card>
          ) : null}

          {/* Card Euro */}
          {euroLoading === 'loading' ? (
            <LoadingCard title="Euro" variant="compact" height={220} />
          ) : euroError ? (
            <ErrorCard error={euroError} title="Erro ao carregar Euro" variant="compact" />
          ) : euroData ? (
            <Card gradient="linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)">
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <EuroSymbolIcon sx={{ fontSize: 20, color: '#feca57' }} />
                  <Typography variant="subtitle2" sx={{ color: '#feca57', fontWeight: 600, fontSize: '0.95rem', opacity: 0.85 }}>
                    Euro
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#feca57', fontWeight: 800, fontSize: { xs: '1.35rem', md: '1.7rem' }, mb: 0 }}>R$ {Number(euroData.bid).toLocaleString('pt-BR', { minimumFractionDigits: 4 })}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>Cotação atual</Typography>
              </Box>
            </Card>
          ) : null}

          {/* Card Dólar */}
          {dollarLoading === 'loading' ? (
            <LoadingCard title="Dólar" variant="compact" height={220} />
          ) : dollarError ? (
            <ErrorCard error={dollarError} title="Erro ao carregar Dólar" variant="compact" />
          ) : dollarData ? (
            <Card gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <MonetizationOnIcon sx={{ fontSize: 20, color: '#4facfe' }} />
                  <Typography variant="subtitle2" sx={{ color: '#4facfe', fontWeight: 600, fontSize: '0.95rem', opacity: 0.85 }}>
                    Dólar
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#4facfe', fontWeight: 800, fontSize: { xs: '1.35rem', md: '1.7rem' }, mb: 0 }}>R$ {Number(dollarData.bid).toLocaleString('pt-BR', { minimumFractionDigits: 4 })}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>Cotação atual</Typography>
              </Box>
            </Card>
          ) : null}

          {/* Card Bitcoin */}
          {bitcoinLoading ? (
            <LoadingCard title="Bitcoin" variant="compact" height={220} />
          ) : bitcoinError ? (
            <ErrorCard error={bitcoinError} title="Erro ao carregar Bitcoin" variant="compact" />
          ) : bitcoinData ? (
            <Card gradient="linear-gradient(135deg, #fbbf24 0%, #f59e42 100%)">
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <CurrencyBitcoinIcon sx={{ fontSize: 20, color: '#fbbf24' }} />
                  <Typography variant="subtitle2" sx={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.95rem', opacity: 0.85 }}>
                    Bitcoin
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#fbbf24', fontWeight: 800, fontSize: { xs: '1.35rem', md: '1.7rem' }, mb: 0 }}>R$ {Number(bitcoinData.brl).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>Cotação em BRL</Typography>
              </Box>
            </Card>
          ) : null}
        </Box>
      </Container>
    </Box>
  );
}