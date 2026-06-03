import { useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useEnergia } from '../../../contexts/EnergiaContext';
import { LoadingCard } from '../../../components/ui/LoadingCard';
import { colors, CardAccentKey, getCardSurfaceSx } from '../../../styles/colors';

const statAccents: CardAccentKey[] = ['green', 'red', 'blue', 'amber'];

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

  const stats = [
    { label: 'Geração', value: `${resumo.totalGeracao.toFixed(2)} kWh` },
    { label: 'Potência Máxima', value: `${resumo.maxPotencia.toFixed(1)} W` },
    { label: 'Potência Média', value: `${resumo.mediaPotencia.toFixed(1)} W` },
    { label: 'Registros do Dia', value: String(resumo.registros) },
  ];

  return (
    <Box>
      <Typography variant="h6" sx={{ color: colors.text.primary, mb: 3, fontWeight: 600 }}>Resumo de Energia Solar</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {stats.map((stat, index) => {
          const accentKey = statAccents[index];
          const accent = colors.cardAccents[accentKey];
          return (
            <Box key={stat.label} sx={{ flex: '1 1 200px', minWidth: 0 }}>
              <Paper elevation={0} sx={{ ...getCardSurfaceSx(accent.color), p: 2.5, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: accent.color }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                  {stat.label}
                </Typography>
              </Paper>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
