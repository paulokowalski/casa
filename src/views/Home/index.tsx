import React from 'react';
import { Box, Typography, Avatar, Chip, Stack, Tooltip, Container } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EuroIcon from '@mui/icons-material/Euro';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

// Hooks personalizados
import { useCearaData, useFipeData, useCurrencyData } from '../../hooks/useApiData';

// Componentes profissionais
import { LoadingCard } from '../../components/ui/LoadingCard';
import { ErrorCard } from '../../components/ui/ErrorCard';
import { Card } from '../../components/Card';

// Configurações
import { API_URLS } from '../../config/urls';
import { DESIGN_CONFIG } from '../../config/constants';

// Tipos
// import { CearaData, FipeData, CurrencyData } from '../../types/api';

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
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Avatar 
            src={data.strBadge} 
            alt="Ceará" 
            sx={{ 
              width: 64, 
              height: 64, 
              bgcolor: '#222',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
            }} 
          />
        </Box>
        
        <Typography variant="h2" fontWeight={800} sx={{ 
          mb: 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {data.intRank}º
        </Typography>
        
        <Typography variant="body2" color="#7f8c8d" sx={{ mb: 2 }}>
          Posição na tabela
        </Typography>
        
        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
          <Tooltip title="Jogos">
            <Chip 
              label={`J: ${data.intPlayed}`} 
              size="small" 
              sx={{ 
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: '#2c3e50',
                fontWeight: 600,
              }}
            />
          </Tooltip>
          <Tooltip title="Vitórias">
            <Chip 
              label={`V: ${data.intWin}`} 
              size="small" 
              sx={{ 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: '#ffffff',
                fontWeight: 600,
              }}
            />
          </Tooltip>
          <Tooltip title="Empates">
            <Chip 
              label={`E: ${data.intDraw}`} 
              size="small" 
              sx={{ 
                background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
                color: '#ffffff',
                fontWeight: 600,
              }}
            />
          </Tooltip>
          <Tooltip title="Derrotas">
            <Chip 
              label={`D: ${data.intLoss}`} 
              size="small" 
              sx={{ 
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                color: '#ffffff',
                fontWeight: 600,
              }}
            />
          </Tooltip>
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
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="h3" fontWeight={700} sx={{ 
          mb: 1,
          background: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {data.price}
        </Typography>
        
        <Typography variant="body2" color="#7f8c8d" sx={{ mb: 2 }}>
          Valor FIPE ({data.referenceMonth})
        </Typography>
        
        <Chip 
          label={`Código: ${data.codeFipe}`} 
          sx={{ 
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            color: '#2c3e50',
            fontWeight: 600,
            mb: 2,
          }} 
        />
        
        <Box display="flex" justifyContent="center">
          <a
            href={`https://www.webmotors.com.br/carros-usados/${encodeURIComponent(data.brand.split(' - ')[1] || data.brand)}/${encodeURIComponent(data.model.split(' ')[0])}?ano=${data.modelYear}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <Chip 
              label="Ver no Mercado" 
              sx={{ 
                background: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)',
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
                transition: 'transform 0.3s ease',
              }} 
            />
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
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="h4" fontWeight={700} sx={{ 
          mb: 1,
          background: gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          R$ {Number(data.bid).toLocaleString('pt-BR', { minimumFractionDigits: 4 })}
        </Typography>
        
        <Typography variant="body2" color="#7f8c8d">
          Compra • Venda: R$ {Number(data.ask).toLocaleString('pt-BR', { minimumFractionDigits: 4 })}
        </Typography>
      </Box>
    </Card>
  );
}

export function Home() {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
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
          Dashboard Kowalski House
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 400,
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
          }}
        >
          Informações em tempo real e insights inteligentes
        </Typography>
      </Box>

      {/* Grid de cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)'
        },
        gap: 3,
      }}>
        {/* Card do Ceará */}
        <Box className="fade-in-up" style={{ animationDelay: '0.1s' }}>
          <CearaTableCard />
        </Box>

        {/* Card da FIPE */}
        <Box className="fade-in-up" style={{ animationDelay: '0.2s' }}>
          <CarFipeCard />
        </Box>

        {/* Card do Dólar */}
        <Box className="fade-in-up" style={{ animationDelay: '0.3s' }}>
          <CurrencyCard 
            url={API_URLS.DOLLAR} 
            icon={<AttachMoneyIcon />} 
            label="Dólar" 
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
        </Box>

        {/* Card do Euro */}
        <Box className="fade-in-up" style={{ animationDelay: '0.4s' }}>
          <CurrencyCard 
            url={API_URLS.EURO} 
            icon={<EuroIcon />} 
            label="Euro" 
            gradient="linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)"
          />
        </Box>
      </Box>
    </Container>
  );
}