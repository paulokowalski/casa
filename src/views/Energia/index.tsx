import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { PageHeader } from '../../components/ui/PageHeader';
import { KpiCard } from '../../components/ui/KpiCard';
import { EnergiaProvider, useEnergia } from '../../contexts/EnergiaContext';
import { MONTHS_PT, formatNumber } from '../../utils/format';
import { Filtro } from './Filtro';
import { GraficoBarrasMensal } from './GraficoBarrasMensal';
import { GraficoBarrasDiario } from './GraficoBarrasDiario';
import { GraficoLinhasPotenciaDia } from './GraficoLinhasPotenciaDia';

function Energia() {
  const { ano, mes, geracaoDiaria, geracaoMensal, loadingDiaria, loadingMensal } = useEnergia();
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);

  useEffect(() => {
    const hoje = new Date();
    const ehMesAtual = Number(ano) === hoje.getFullYear() && Number(mes) === hoje.getMonth() + 1;
    setDiaSelecionado(ehMesAtual ? hoje.getDate() : null);
  }, [ano, mes]);

  const resumo = useMemo(() => {
    const comGeracao = geracaoDiaria.filter((d) => d.geracao > 0);
    const totalMes = comGeracao.reduce((a, d) => a + d.geracao, 0);
    const melhor = comGeracao.reduce<(typeof comGeracao)[number] | null>(
      (a, d) => (!a || d.geracao > a.geracao ? d : a),
      null,
    );
    const totalAno = geracaoMensal.reduce((a, m) => a + m.geracao, 0);
    return {
      totalMes,
      media: comGeracao.length ? totalMes / comGeracao.length : null,
      melhor,
      totalAno,
      dias: comGeracao.length,
    };
  }, [geracaoDiaria, geracaoMensal]);

  const nomeMes = MONTHS_PT[Number(mes) - 1];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
      <PageHeader section="Casa" title="Energia Solar" subtitle="Geração dos painéis por ano, mês e dia" />

      <Filtro />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
          gap: { xs: 1.5, md: 2.5 },
        }}
      >
        <KpiCard
          label={`Geração em ${nomeMes}`}
          tone="warning"
          icon={<WbSunnyOutlinedIcon />}
          loading={loadingDiaria}
          value={`${formatNumber(resumo.totalMes, 0)} kWh`}
          footer={`${resumo.dias} dias com geração`}
        />
        <KpiCard
          label="Média diária"
          tone="brand"
          icon={<ShowChartIcon />}
          loading={loadingDiaria}
          value={resumo.media !== null ? `${formatNumber(resumo.media)} kWh` : '—'}
        />
        <KpiCard
          label="Melhor dia do mês"
          tone="success"
          icon={<EmojiEventsOutlinedIcon />}
          loading={loadingDiaria}
          value={resumo.melhor ? `${formatNumber(resumo.melhor.geracao)} kWh` : '—'}
          footer={resumo.melhor ? `dia ${resumo.melhor.dia}` : undefined}
        />
        <KpiCard
          label={`Geração em ${ano}`}
          tone="violet"
          icon={<CalendarMonthOutlinedIcon />}
          loading={loadingMensal}
          value={`${formatNumber(resumo.totalAno, 0)} kWh`}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
          gap: { xs: 2, md: 2.5 },
        }}
      >
        <GraficoBarrasMensal />
        <GraficoBarrasDiario diaSelecionado={diaSelecionado} onDiaClick={setDiaSelecionado} />
      </Box>

      <GraficoLinhasPotenciaDia diaSelecionado={diaSelecionado} />
    </Box>
  );
}

export function EnergiaWithProvider() {
  return (
    <EnergiaProvider>
      <Energia />
    </EnergiaProvider>
  );
}
