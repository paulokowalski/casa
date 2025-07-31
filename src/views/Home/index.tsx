import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EuroSymbolIcon from '@mui/icons-material/EuroSymbol';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

import { LoadingCard } from '../../components/ui/LoadingCard';
import { ErrorCard } from '../../components/ui/ErrorCard';
import { Card } from '../../components/Card';
import { getGeracaoSolar } from '../../services/api';
import { getCearaNova } from '../../services/api';
import type { CearaNovaApiResponse } from '../../types/api';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { getRodadaAtual } from '../../services/api';
import type { RodadaAtualApiResponse } from '../../types/api';

import { API_URLS } from '../../config/urls';
import { useFipeData, useCurrencyData } from '../../hooks/useApiData';
import { useFinanca } from '../../contexts/FinancaContext';

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
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      background: '#23263a',
      border: '1px solid #444857',
      flex: '0 0 auto',
      gap: 1.5,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 36, pt: 0.5 }}>{icon}</Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '1rem', mb: 0.2, color: '#f5f6fa' }}>{title}</Typography>
        {loading ? (
          <Typography variant="caption" sx={{ color: '#a0aec0' }}>Carregando...</Typography>
        ) : error ? (
          <Typography variant="caption" color="error">Erro</Typography>
        ) : (
          <Box sx={{ width: '100%', color: '#f5f6fa' }}>{label} {value}</Box>
        )}
      </Box>
    </Paper>
  );
}

function CearaNovaCard({ compact }: { compact?: boolean }) {
  const [data, setData] = React.useState<CearaNovaApiResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [rodada, setRodada] = React.useState<RodadaAtualApiResponse | null>(null);
  const [loadingRodada, setLoadingRodada] = React.useState(true);
  const [errorRodada, setErrorRodada] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    getCearaNova(1837)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Erro ao buscar dados do Ceará');
        setLoading(false);
      });
    setLoadingRodada(true);
    getRodadaAtual(1837)
      .then(res => {
        setRodada(res.data);
        setLoadingRodada(false);
      })
      .catch(err => {
        setErrorRodada('Erro ao buscar próximo confronto');
        setLoadingRodada(false);
      });
  }, []);

  if (loading) {
    return <LoadingCard title="Ceará" variant="detailed" />;
  }
  if (error) {
    return <ErrorCard error={error} title="Erro ao carregar dados do Ceará" />;
  }
  if (!data) {
    return <ErrorCard error="Nenhum dado disponível" title="Dados não encontrados" />;
  }

  return (
    <Card gradient="linear-gradient(135deg, #23263a 0%, #6366f1 100%)" sx={{ p: compact ? 2 : { xs: 2, md: 3 }, minHeight: compact ? 220 : 320 }}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: compact ? 'row' : 'column', alignItems: 'center', justifyContent: compact ? 'flex-start' : 'flex-start', py: 1, gap: compact ? 2 : 0 }}>
        {/* Header: escudo, nome, posição */}
        <Box sx={{ background: 'transparent', borderRadius: '50%', p: 0.5, boxShadow: 2, minWidth: 48 }}>
          {data.imagem ? (
            <img src={data.imagem} alt={data.nomeTime} style={{ width: 48, height: 48, objectFit: 'contain', display: 'block', borderRadius: '50%' }} />
          ) : (
            <SportsSoccerIcon sx={{ fontSize: 48, color: '#8b5cf6' }} />
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, textAlign: compact ? 'left' : 'center' }}>
          <Typography variant={compact ? 'subtitle1' : 'h6'} sx={{ color: '#f5f6fa', fontWeight: 800, fontSize: compact ? '1rem' : '1.2rem', letterSpacing: 1 }}>{data.nomeTime}</Typography>
          <Typography variant="caption" sx={{ color: '#a0aec0', fontWeight: 600, fontSize: compact ? '0.85rem' : '0.95rem' }}>Posição: <b>{data.posicao}º</b></Typography>
          <Typography variant={compact ? 'h5' : 'h3'} sx={{ color: '#8b5cf6', fontWeight: 900, mb: compact ? 0.5 : 1, letterSpacing: 2, textShadow: '0 2px 8px #23263a' }}>{data.pontos} pts</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: compact ? 'flex-start' : 'center', gap: 0.5, mb: 1 }}>
            <Box sx={{ bgcolor: '#10b981', color: '#fff', borderRadius: 2, px: 1, py: 0.2, fontWeight: 700, fontSize: '0.75rem' }}>V: {data.vitorias}</Box>
            <Box sx={{ bgcolor: '#f59e42', color: '#fff', borderRadius: 2, px: 1, py: 0.2, fontWeight: 700, fontSize: '0.75rem' }}>E: {data.empates}</Box>
            <Box sx={{ bgcolor: '#ef4444', color: '#fff', borderRadius: 2, px: 1, py: 0.2, fontWeight: 700, fontSize: '0.75rem' }}>D: {data.derrotas}</Box>
            <Box sx={{ bgcolor: '#6366f1', color: '#fff', borderRadius: 2, px: 1, py: 0.2, fontWeight: 700, fontSize: '0.75rem' }}>GP: {data.golsPro}</Box>
            <Box sx={{ bgcolor: '#6366f1', color: '#fff', borderRadius: 2, px: 1, py: 0.2, fontWeight: 700, fontSize: '0.75rem' }}>GC: {data.golsContra}</Box>
            <Box sx={{ bgcolor: data.saldoGols >= 0 ? '#10b981' : '#ef4444', color: '#fff', borderRadius: 2, px: 1, py: 0.2, fontWeight: 700, fontSize: '0.75rem' }}>SG: {data.saldoGols}</Box>
          </Box>
        </Box>
      </Box>
      {/* Footer: Próximo confronto */}
      <Box sx={{ width: '100%', mt: 1, p: 1, borderRadius: 2, background: 'rgba(99,102,241,0.10)', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', boxShadow: 0 }}>
        {loadingRodada ? (
          <Typography variant="caption" sx={{ color: '#a0aec0' }}>Carregando confronto...</Typography>
        ) : errorRodada ? (
          <Typography variant="caption" color="error">{errorRodada}</Typography>
        ) : rodada ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <img src={rodada.imagemTimeCasa} alt={rodada.timeCasa} style={{ width: 24, height: 24, objectFit: 'contain', borderRadius: 12, border: '1px solid #eee', background: 'transparent' }} />
              <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 700 }}>{rodada.timeCasa}</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#8b5cf6', fontWeight: 900, fontSize: '1rem', mx: 1 }}>{rodada.golsTimeCasa} <span style={{ color: '#a0aec0', fontWeight: 400 }}>x</span> {rodada.golsTimeVisitante}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <img src={rodada.imagemTimeVisitante} alt={rodada.timeVisitante} style={{ width: 24, height: 24, objectFit: 'contain', borderRadius: 12, border: '1px solid #eee', background: 'transparent' }} />
              <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 700 }}>{rodada.timeVisitante}</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#a0aec0', fontWeight: 600, ml: 2 }}>
              {rodada.dataJogo ? new Date(rodada.dataJogo).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
            </Typography>
          </>
        ) : null}
      </Box>
    </Card>
  );
}

export function Home() {
  // Hooks para dados reais
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

  // Estado para geração solar
  const [potencias, setPotencias] = React.useState<any[]>([]);
  const [geracaoLoading, setGeracaoLoading] = React.useState(true);
  const [geracaoError, setGeracaoError] = React.useState<string | null>(null);
  const [geracaoValor, setGeracaoValor] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Buscar geração solar do dia atual
    const hoje = new Date();
    const dataStr = hoje.toISOString().slice(0, 10); // yyyy-mm-dd
    setGeracaoLoading(true);
    getGeracaoSolar(dataStr)
      .then(res => {
        const payload = res.data;
        // Exibe todos os registros recebidos, sem agrupar
        let dadosGrafico: { horario: string, potencia: number }[] = [];
        
        // Verificar diferentes possíveis estruturas de dados
        let listaDados = null;
        if (payload && payload.potencias) {
          listaDados = payload.potencias;
        } else if (payload && payload.valores) {
          listaDados = payload.valores;
        }
        
        if (listaDados && Array.isArray(listaDados)) {
          dadosGrafico = listaDados.map((item: any) => {
            let horario = '';
            let potencia = 0;
            
            // Verificar diferentes formatos de data
            if (item.data && Array.isArray(item.data) && item.data.length >= 6) {
              const [ano, mes, dia, hora, minuto, segundo] = item.data;
              horario = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
            } else if (typeof item.data === 'string') {
              const partes = item.data.split('T')[1]?.split(':');
              if (partes && partes.length >= 2) {
                horario = `${partes[0]}:${partes[1]}`;
              }
            }
            
            // Verificar diferentes nomes do campo de potência
            potencia = item.potencia !== undefined ? item.potencia : 
                     item.valor !== undefined ? item.valor : 0;
            
            return {
              horario,
              potencia,
            };
          });
        }
        setPotencias(dadosGrafico);
        if (payload && (payload.gerado !== undefined || payload.geracao !== undefined)) {
          const valor = payload.gerado !== undefined ? payload.gerado : payload.geracao;
          setGeracaoValor(valor);
        } else {
          setGeracaoValor(null);
        }
        setGeracaoLoading(false);
      })
      .catch(err => {
        setGeracaoError('Erro ao buscar geração solar');
        setGeracaoLoading(false);
      });
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', background: theme => theme.palette.background.default, py: 0 }}>
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
        {/* Header da página */}
        <Box sx={{ mt: 10, mb: 6, textAlign: 'center' }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 900,
              mb: 2,
              color: '#f5f6fa',
              textShadow: '0 6px 24px rgba(139, 92, 246, 0.3)',
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
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
          gap: 3,
          justifyContent: 'center',
          alignItems: 'stretch',
          pb: 2,
        }}>
          {/* Card Despesas a vencer */}
          <DashboardInfoCard
            icon={<CalendarMonthIcon sx={{ color: '#ef4444', fontSize: 28 }} />}
            title="Despesas a vencer"
            value={qtdLoading === true ? '...' : qtdDespesas !== null ? qtdDespesas : '--'}
            loading={qtdLoading === true}
            error={false}
            label="Próx. 30 dias"
          />
          {/* Card Geração Solar */}
          <DashboardInfoCard
            icon={<WbSunnyIcon sx={{ color: '#fbbf24', fontSize: 28 }} />}
            title="Geração Solar"
            value={geracaoValor !== null ? `${geracaoValor} kWh` : '—'}
            loading={geracaoLoading}
            error={!!geracaoError}
            label="Hoje"
          />
          {/* Card Dólar */}
          <DashboardInfoCard
            icon={<MonetizationOnIcon sx={{ color: '#4facfe', fontSize: 28 }} />}
            title="Dólar"
            value={dollarLoading === 'loading' ? '...' : dollarError ? 'Erro' : dollarData ? `R$ ${Number(dollarData.bid).toLocaleString('pt-BR', { minimumFractionDigits: 4 })}` : '--'}
            loading={dollarLoading === 'loading'}
            error={!!dollarError}
            label="Cotação"
          />
          {/* Card Euro */}
          <DashboardInfoCard
            icon={<EuroSymbolIcon sx={{ color: '#f59e0b', fontSize: 28 }} />}
            title="Euro"
            value={euroLoading === 'loading' ? '...' : euroError ? 'Erro' : euroData ? `R$ ${Number(euroData.bid).toLocaleString('pt-BR', { minimumFractionDigits: 4 })}` : '--'}
            loading={euroLoading === 'loading'}
            error={!!euroError}
            label="Cotação"
          />
          {/* Card FIPE */}
          <DashboardInfoCard
            icon={<DirectionsCarFilledIcon sx={{ color: '#36d1dc', fontSize: 28 }} />}
            title="FIPE"
            value={fipeLoading === 'loading' ? '...' : fipeError ? 'Erro' : fipeData ? `R$ ${fipeData.price}` : '--'}
            loading={fipeLoading === 'loading'}
            error={!!fipeError}
            label={fipeData ? `${fipeData.brand} ${fipeData.model}` : ''}
          />
          {/* Card Ceará Nova API - compacto, ocupa 2 colunas no desktop */}
          <Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 2' }, minWidth: 0 }}>
            <CearaNovaCard compact />
          </Box>
        </Box>
        {/* Gráfico de Potência Solar */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#fbbf24' }}>
            Potência Solar (W) durante o dia
          </Typography>
          {geracaoLoading ? (
            <LoadingCard title="Potência Solar" variant="detailed" />
          ) : geracaoError ? (
            <ErrorCard error={geracaoError} title="Erro ao carregar geração solar" />
          ) : (
            <Box sx={{ background: '#23263a', borderRadius: 2, p: 2 }}>
              {potencias.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={potencias} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444857" />
                    <XAxis dataKey="horario" tick={{ fill: '#f5f6fa' }} />
                    <YAxis label={{ value: 'Potência (W)', angle: -90, position: 'insideLeft', fill: '#f5f6fa' }} tick={{ fill: '#f5f6fa' }} />
                    <RechartsTooltip contentStyle={{ background: '#181a20', color: '#f5f6fa', border: '1px solid #6366f1' }} formatter={(v: any) => `${v} W`} />
                    <Line type="monotone" dataKey="potencia" stroke="#fbbf24" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body1" sx={{ color: '#f5f6fa', textAlign: 'center' }}>
                    Nenhum dado de potência disponível para hoje
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}