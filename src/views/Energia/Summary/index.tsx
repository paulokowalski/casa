import { useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useEnergia } from '../../../contexts/EnergiaContext';
import { LoadingCard } from '../../../components/ui/LoadingCard';

export function Summary() {
  const { dadosEnergia, geracaoTotal, loading } = useEnergia();

  const resumo = useMemo(() => {
    if (!dadosEnergia || dadosEnergia.length === 0) {
      return {
        totalGeracao: 0,
        maxPotencia: 0,
        mediaPotencia: 0,
        registros: 0,
      };
    }

    const maxPotencia = Math.max(...dadosEnergia.map(d => d.geracao));
    const mediaPotencia = dadosEnergia.reduce((acc, dado) => acc + dado.geracao, 0) / dadosEnergia.length;
    const registros = dadosEnergia.length;

    return {
      totalGeracao: geracaoTotal,
      maxPotencia,
      mediaPotencia,
      registros,
    };
  }, [dadosEnergia, geracaoTotal]);

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <LoadingCard title="Resumo de Energia Solar" variant="detailed" />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#f5f6fa', mb: 3 }}>Resumo de Energia Solar</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
              color: 'white',
              borderRadius: 2,
              boxShadow: '0 4px 16px rgba(52, 211, 153, 0.3)',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {resumo.totalGeracao.toFixed(2)} kWh
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Geração
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
              color: 'white',
              borderRadius: 2,
              boxShadow: '0 4px 16px rgba(248, 113, 113, 0.3)',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {resumo.maxPotencia.toFixed(1)} W
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Potência Máxima
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
              color: 'white',
              borderRadius: 2,
              boxShadow: '0 4px 16px rgba(96, 165, 250, 0.3)',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {resumo.mediaPotencia.toFixed(1)} W
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Potência Média
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              borderRadius: 2,
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {resumo.registros}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Registros do Dia
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
} 