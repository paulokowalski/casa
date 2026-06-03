import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EuroSymbolIcon from '@mui/icons-material/EuroSymbol';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

import { LoadingCard } from '../../components/ui/LoadingCard';
import { ErrorCard } from '../../components/ui/ErrorCard';
import { Card } from '../../components/Card';
import { getGeracaoSolar } from '../../services/api';
import { getCearaNova } from '../../services/api';
import type { CearaNovaApiResponse } from '../../types/api';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { getRodadaAtual } from '../../services/api';
import { getCarroFipe } from '../../services/api';
import type { RodadaAtualApiResponse } from '../../types/api';

import { API_URLS } from '../../config/urls';
import { useFipeData, useCurrencyData } from '../../hooks/useApiData';
import { colors, CardAccentKey, getCardSurfaceSx } from '../../styles/colors';

function DashboardInfoCard({ icon, title, value, loading, error, label, accentKey }: {
  icon: React.ReactNode,
  title: string,
  value: React.ReactNode,
  loading?: boolean,
  error?: boolean,
  label?: string,
  accentKey: CardAccentKey,
}) {
  const accent = colors.cardAccents[accentKey];
  return (
    <Paper elevation={0} sx={{
      display: 'flex',
      alignItems: 'flex-start',
      width: '100%',
      px: 2,
      py: 2,
      borderRadius: 2,
      ...getCardSurfaceSx(accent.color),
      gap: 1.5,
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 44,
        height: 44,
        borderRadius: 1.5,
        bgcolor: accent.iconBg,
        color: accent.color,
        flexShrink: 0,
      }}>
        {icon}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.8125rem', mb: 0.25, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</Typography>
        {loading ? (
          <Typography variant="caption" sx={{ color: colors.text.muted }}>Carregando...</Typography>
        ) : error ? (
          <Typography variant="caption" color="error">Erro</Typography>
        ) : (
          <Box sx={{ width: '100%', color: colors.text.primary, fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3 }}>
            {label && <Typography component="span" variant="body2" sx={{ color: colors.text.muted, fontWeight: 500, mr: 0.5 }}>{label}</Typography>}
            {value}
          </Box>
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
    <Card gradient={colors.primary.light} sx={{ p: compact ? 2 : { xs: 2, md: 3 }, minHeight: compact ? 220 : 320 }}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: compact ? 'row' : 'column', alignItems: 'center', justifyContent: compact ? 'flex-start' : 'flex-start', py: 1, gap: compact ? 2 : 0 }}>
        <Box sx={{ background: 'transparent', borderRadius: '50%', p: 0.5, minWidth: 48 }}>
          {data.imagem ? (
            <img src={data.imagem} alt={data.nomeTime} style={{ width: 48, height: 48, objectFit: 'contain', display: 'block', borderRadius: '50%' }} />
          ) : (
            <SportsSoccerIcon sx={{ fontSize: 48, color: colors.primary.light }} />
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, textAlign: compact ? 'left' : 'center' }}>
          <Typography variant={compact ? 'subtitle1' : 'h6'} sx={{ color: colors.text.primary, fontWeight: 700, fontSize: compact ? '1rem' : '1.2rem' }}>{data.nomeTime}</Typography>
          <Typography variant="caption" sx={{ color: colors.text.secondary, fontWeight: 500, fontSize: compact ? '0.85rem' : '0.95rem' }}>Posição: <b>{data.posicao}º</b></Typography>
          <Typography variant={compact ? 'h5' : 'h3'} sx={{ color: colors.primary.light, fontWeight: 800, mb: compact ? 0.5 : 1 }}>{data.pontos} pts</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: compact ? 'flex-start' : 'center', gap: 0.5, mb: 1 }}>
            <Box sx={{ bgcolor: colors.semantic.success, color: '#fff', borderRadius: 1, px: 1, py: 0.2, fontWeight: 600, fontSize: '0.75rem' }}>V: {data.vitorias}</Box>
            <Box sx={{ bgcolor: colors.semantic.warning, color: '#fff', borderRadius: 1, px: 1, py: 0.2, fontWeight: 600, fontSize: '0.75rem' }}>E: {data.empates}</Box>
            <Box sx={{ bgcolor: colors.semantic.error, color: '#fff', borderRadius: 1, px: 1, py: 0.2, fontWeight: 600, fontSize: '0.75rem' }}>D: {data.derrotas}</Box>
            <Box sx={{ bgcolor: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}`, borderRadius: 1, px: 1, py: 0.2, fontWeight: 600, fontSize: '0.75rem' }}>GP: {data.golsPro}</Box>
            <Box sx={{ bgcolor: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}`, borderRadius: 1, px: 1, py: 0.2, fontWeight: 600, fontSize: '0.75rem' }}>GC: {data.golsContra}</Box>
            <Box sx={{ bgcolor: data.saldoGols >= 0 ? colors.semantic.success : colors.semantic.error, color: '#fff', borderRadius: 1, px: 1, py: 0.2, fontWeight: 600, fontSize: '0.75rem' }}>SG: {data.saldoGols}</Box>
          </Box>
        </Box>
      </Box>
      <Box sx={{ width: '100%', mt: 1, p: 1.5, borderRadius: 1.5, background: colors.primary.subtle, border: `1px solid ${colors.border.default}`, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {loadingRodada ? (
          <Typography variant="caption" sx={{ color: colors.text.secondary }}>Carregando confronto...</Typography>
        ) : errorRodada ? (
          <Typography variant="caption" color="error">{errorRodada}</Typography>
        ) : rodada ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <img src={rodada.imagemTimeCasa} alt={rodada.timeCasa} style={{ width: 24, height: 24, objectFit: 'contain', borderRadius: 12, border: `1px solid ${colors.border.default}`, background: 'transparent' }} />
              <Typography variant="caption" sx={{ color: colors.text.primary, fontWeight: 600 }}>{rodada.timeCasa}</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: colors.primary.light, fontWeight: 700, fontSize: '1rem', mx: 1 }}>{rodada.golsTimeCasa} <span style={{ color: colors.text.muted, fontWeight: 400 }}>x</span> {rodada.golsTimeVisitante}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <img src={rodada.imagemTimeVisitante} alt={rodada.timeVisitante} style={{ width: 24, height: 24, objectFit: 'contain', borderRadius: 12, border: `1px solid ${colors.border.default}`, background: 'transparent' }} />
              <Typography variant="caption" sx={{ color: colors.text.primary, fontWeight: 600 }}>{rodada.timeVisitante}</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: colors.text.secondary, fontWeight: 500, ml: 2 }}>
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

  // Estado para geração solar
  const [potencias, setPotencias] = React.useState<any[]>([]);
  const [geracaoLoading, setGeracaoLoading] = React.useState(true);
  const [geracaoError, setGeracaoError] = React.useState<string | null>(null);
  const [geracaoValor, setGeracaoValor] = React.useState<number | null>(null);
  const [fipeHistorico, setFipeHistorico] = React.useState<Array<{ referencia: string; valor: number }>>([]);
  const [fipeHistoricoLoading, setFipeHistoricoLoading] = React.useState(true);
  const [fipeHistoricoError, setFipeHistoricoError] = React.useState<string | null>(null);

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

  React.useEffect(() => {
    setFipeHistoricoLoading(true);
    getCarroFipe('004525-0')
      .then(res => {
        const payload = res.data;
        const historicoBruto = Array.isArray(payload)
          ? payload
          : payload?.historico ?? payload?.valores ?? payload?.dados ?? [];

        const normalizado = (Array.isArray(historicoBruto) ? historicoBruto : [])
          .map((item: any, idx: number) => {
            const referencia = item?.mesReferencia
              ?? item?.referencia
              ?? item?.dataReferencia
              ?? item?.data
              ?? `${idx + 1}`;

            const valorBruto = item?.valor
              ?? item?.preco
              ?? item?.price
              ?? item?.valorFipe
              ?? item;

            const valor = typeof valorBruto === 'number'
              ? valorBruto
              : Number(
                String(valorBruto)
                  .replace('R$', '')
                  .replace(/\./g, '')
                  .replace(',', '.')
                  .trim(),
              );

            return {
              referencia: String(referencia),
              valor: Number.isFinite(valor) ? valor : 0,
            };
          })
          .filter((item: { valor: number }) => item.valor > 0);

        setFipeHistorico(normalizado);
        setFipeHistoricoLoading(false);
      })
      .catch(() => {
        setFipeHistoricoError('Erro ao buscar histórico FIPE do veículo');
        setFipeHistoricoLoading(false);
      });
  }, []);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', pb: 6, boxSizing: 'border-box' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ color: colors.text.secondary }}>
          Visão geral das informações da casa
        </Typography>
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
        gap: 2,
        width: '100%',
        mb: 4,
      }}>
          {/* Card Geração Solar */}
          <DashboardInfoCard
            accentKey="amber"
            icon={<WbSunnyIcon sx={{ fontSize: 24 }} />}
            title="Geração Solar"
            value={geracaoValor !== null ? `${geracaoValor} kWh` : '—'}
            loading={geracaoLoading}
            error={!!geracaoError}
            label="Hoje"
          />
          <DashboardInfoCard
            accentKey="blue"
            icon={<MonetizationOnIcon sx={{ fontSize: 24 }} />}
            title="Dólar"
            value={dollarLoading === 'loading' ? '...' : dollarError ? 'Erro' : dollarData ? `R$ ${Number(dollarData.bid).toLocaleString('pt-BR', { minimumFractionDigits: 4 })}` : '--'}
            loading={dollarLoading === 'loading'}
            error={!!dollarError}
            label="Cotação"
          />
          <DashboardInfoCard
            accentKey="violet"
            icon={<EuroSymbolIcon sx={{ fontSize: 24 }} />}
            title="Euro"
            value={euroLoading === 'loading' ? '...' : euroError ? 'Erro' : euroData ? `R$ ${Number(euroData.bid).toLocaleString('pt-BR', { minimumFractionDigits: 4 })}` : '--'}
            loading={euroLoading === 'loading'}
            error={!!euroError}
            label="Cotação"
          />
          <DashboardInfoCard
            accentKey="cyan"
            icon={<DirectionsCarFilledIcon sx={{ fontSize: 24 }} />}
            title="FIPE"
            value={fipeLoading === 'loading' ? '...' : fipeError ? 'Erro' : fipeData ? `R$ ${fipeData.price}` : '--'}
            loading={fipeLoading === 'loading'}
            error={!!fipeError}
            label={fipeData ? `${fipeData.brand} ${fipeData.model}` : ''}
          />
        </Box>

      <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.text.primary }}>
            Potência Solar (W) durante o dia
          </Typography>
          {geracaoLoading ? (
            <LoadingCard title="Potência Solar" variant="detailed" />
          ) : geracaoError ? (
            <ErrorCard error={geracaoError} title="Erro ao carregar geração solar" />
          ) : (
            <Box sx={{ ...getCardSurfaceSx(colors.chart.amber), borderRadius: 2, p: 2 }}>
              {potencias.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={potencias} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.grid} />
                    <XAxis dataKey="horario" tick={{ fill: colors.text.secondary, fontSize: 12 }} />
                    <YAxis label={{ value: 'Potência (W)', angle: -90, position: 'insideLeft', fill: colors.text.secondary }} tick={{ fill: colors.text.secondary, fontSize: 12 }} />
                    <RechartsTooltip contentStyle={{ background: colors.chart.tooltipBg, color: colors.text.primary, border: `1px solid ${colors.chart.tooltipBorder}`, borderRadius: 8 }} formatter={(v: any) => `${v} W`} />
                    <Line type="monotone" dataKey="potencia" stroke={colors.chart.amber} dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body1" sx={{ color: colors.text.secondary, textAlign: 'center' }}>
                    Nenhum dado de potência disponível para hoje
                  </Typography>
                </Box>
              )}
            </Box>
          )}
      </Box>

      <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.text.primary }}>
            Histórico FIPE do Veículo
          </Typography>
          {fipeHistoricoLoading ? (
            <LoadingCard title="Histórico FIPE" variant="detailed" />
          ) : fipeHistoricoError ? (
            <ErrorCard error={fipeHistoricoError} title="Erro ao carregar histórico FIPE" />
          ) : (
            <Box sx={{ ...getCardSurfaceSx(colors.chart.cyan), borderRadius: 2, p: 2 }}>
              {fipeHistorico.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={fipeHistorico} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.grid} />
                    <XAxis dataKey="referencia" tick={{ fill: colors.text.secondary, fontSize: 12 }} />
                    <YAxis
                      tick={{ fill: colors.text.secondary, fontSize: 12 }}
                      tickFormatter={(v: number) => `R$ ${Number(v).toLocaleString('pt-BR')}`}
                    />
                    <RechartsTooltip
                      contentStyle={{ background: colors.chart.tooltipBg, color: colors.text.primary, border: `1px solid ${colors.chart.tooltipBorder}`, borderRadius: 8 }}
                      formatter={(v: any) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    />
                    <Line type="monotone" dataKey="valor" stroke={colors.chart.cyan} dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body1" sx={{ color: colors.text.secondary, textAlign: 'center' }}>
                    Nenhum histórico FIPE disponível para este veículo
                  </Typography>
                </Box>
              )}
            </Box>
          )}
      </Box>
    </Box>
  );
}