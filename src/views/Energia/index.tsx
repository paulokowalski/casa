import { Box, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { Filtro } from './Filtro';
import { EnergiaProvider, useEnergia } from '../../contexts/EnergiaContext';
import { Card } from '../../components/Card';
import { Theme } from '@mui/material/styles';
import { GraficoBarrasMensal } from './GraficoBarrasMensal';
import { GraficoBarrasDiario } from './GraficoBarrasDiario';
import { GraficoLinhasPotenciaDia } from './GraficoLinhasPotenciaDia';
import { colors } from '../../styles/colors';

export function Energia() {
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const { mes } = useEnergia();

  useEffect(() => {
    setDiaSelecionado(null);
  }, [mes]);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', pb: 6, boxSizing: 'border-box' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ color: colors.text.secondary }}>
          Monitoramento de geração e consumo
        </Typography>
      </Box>

      {/* Filtros */}
      <Card
        sx={{ mb: 3, background: (theme: Theme) => theme.palette.background.paper, minHeight: 80, width: '100%', maxWidth: '100%' }}
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
          <GraficoBarrasDiario onDiaClick={setDiaSelecionado} diaSelecionado={diaSelecionado} />
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