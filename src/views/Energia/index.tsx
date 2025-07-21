import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { Filtro } from './Filtro';
import { EnergiaProvider } from '../../contexts/EnergiaContext';
import { Card } from '../../components/Card';
import { Theme } from '@mui/material/styles';
import { GraficoBarrasMensal } from './GraficoBarrasMensal';
import { GraficoBarrasJulho } from './GraficoBarrasJulho';
import { GraficoLinhasPotenciaDia } from './GraficoLinhasPotenciaDia';

export function Energia() {
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', pb: 6, boxSizing: 'border-box', px: { xs: 1, sm: 3, md: 6 }, mt: 10 }}>
      {/* Header da página */}
      <Box sx={{ mb: 2, textAlign: 'center', width: '100%' }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 800,
            mb: 1,
            color: '#f5f6fa',
            textShadow: '0 4px 16px rgba(34, 211, 153, 0.3)',
          }}
        >
          Energia Solar
        </Typography>
      </Box>

      {/* Filtros */}
      <Card 
        sx={{ mb: 3, borderRadius: 0.5, background: (theme: Theme) => theme.palette.background.paper, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', minHeight: 80, width: '100%', maxWidth: '100%' }}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 3,
          flexWrap: { xs: 'nowrap', sm: 'wrap' },
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          py: 2,
          px: 3,
        }}>
          <Filtro />
        </Box>
      </Card>

      {/* Gráficos lado a lado */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, width: '100%' }}>
        <Box sx={{ flex: 1 }}>
          <GraficoBarrasMensal />
        </Box>
        <Box sx={{ flex: 1 }}>
          <GraficoBarrasJulho onDiaClick={setDiaSelecionado} diaSelecionado={diaSelecionado} />
        </Box>
      </Box>

      {/* Gráfico de linhas de potência do dia selecionado */}
      <GraficoLinhasPotenciaDia diaSelecionado={diaSelecionado} />
    </Box>
  );
}

// Wrapper com provider
export function EnergiaWithProvider() {
  return (
    <EnergiaProvider>
      <Energia />
    </EnergiaProvider>
  );
} 