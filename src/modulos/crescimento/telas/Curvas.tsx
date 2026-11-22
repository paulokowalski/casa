import { useMemo, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { crescimentoApi } from '../api';
import { Carregando, Erro } from '../componentes';
import { acento, cor } from '../estilo';
import { dataCurta, percentil } from '../formato';
import { useCarregar } from '../useCarregar';
import type { Indicador } from '../tipos';
import type { PropsAba } from '.';

const DIAS_MES = 30.4375;
const INDICADORES: { id: Indicador; rotulo: string }[] = [
  { id: 'PESO', rotulo: 'Peso' },
  { id: 'COMPRIMENTO', rotulo: 'Altura' },
  { id: 'PERIMETRO', rotulo: 'Cabeça' },
];

interface Linha {
  meses: number;
  p3?: number;
  p15?: number;
  p50?: number;
  p85?: number;
  p97?: number;
  faixa?: [number, number];
  crianca?: number;
  percentil?: number | null;
  data?: string;
}

const fmtMeses = (m: number) => (m < 24 ? `${Math.round(m)}m` : `${Math.round((m / 12) * 10) / 10}a`);

export function Curvas({ crianca, versao }: Readonly<PropsAba>) {
  const [indicador, setIndicador] = useState<Indicador>('PESO');
  const {
    dados: curva,
    erro,
    recarregar,
  } = useCarregar(() => crescimentoApi.curva(crianca.id, indicador), [crianca.id, indicador, versao]);
  const forte = acento(crianca.sexo).forte;

  const linhas = useMemo<Linha[]>(() => {
    if (!curva) return [];
    const ref: Linha[] = curva.referencia.map((r) => ({
      meses: r.dias / DIAS_MES,
      p3: r.p3,
      p15: r.p15,
      p50: r.p50,
      p85: r.p85,
      p97: r.p97,
      faixa: [r.p15, r.p85],
    }));
    const pts: Linha[] = curva.pontos.map((p) => ({
      meses: Math.max(0, p.dias) / DIAS_MES,
      crianca: p.valor,
      percentil: p.percentil,
      data: p.data,
    }));
    return [...ref, ...pts].sort((a, b) => a.meses - b.meses);
  }, [curva]);

  return (
    <Box>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={indicador}
        onChange={(_e, v: Indicador | null) => v && setIndicador(v)}
        sx={{ mb: 2 }}
        aria-label="Medida"
      >
        {INDICADORES.map((i) => (
          <ToggleButton key={i.id} value={i.id} sx={{ px: 2 }}>
            {i.rotulo}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {erro && !curva ? (
        <Erro mensagem={erro} tentar={recarregar} />
      ) : !curva ? (
        <Carregando linhas={1} />
      ) : (
        <>
          <Box sx={{ bgcolor: cor.papel, border: `1px solid ${cor.borda}`, borderRadius: 3, p: { xs: 1, sm: 2 } }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, px: 1 }}>
              {curva.nome} ({curva.unidade}) pela idade{curva.idadeCorrigida ? ' corrigida' : ''}. A faixa verde vai do
              percentil 15 ao 85; as linhas tracejadas marcam P3 e P97.
            </Typography>
            <Box sx={{ height: { xs: 300, sm: 400 } }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={linhas} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
                  <CartesianGrid stroke={cor.borda} />
                  <XAxis
                    dataKey="meses"
                    type="number"
                    domain={[0, 'dataMax']}
                    tickFormatter={fmtMeses}
                    tick={{ fontSize: 11, fill: cor.tintaSuave }}
                    allowDecimals={false}
                  />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: cor.tintaSuave }} width={48} />
                  <Area
                    dataKey="faixa"
                    stroke="none"
                    fill={cor.menta}
                    fillOpacity={0.25}
                    isAnimationActive={false}
                    connectNulls
                    activeDot={false}
                  />
                  <Line
                    dataKey="p3"
                    stroke={cor.amarelo}
                    strokeDasharray="4 4"
                    dot={false}
                    isAnimationActive={false}
                    connectNulls
                    activeDot={false}
                  />
                  <Line
                    dataKey="p97"
                    stroke={cor.amarelo}
                    strokeDasharray="4 4"
                    dot={false}
                    isAnimationActive={false}
                    connectNulls
                    activeDot={false}
                  />
                  <Line
                    dataKey="p50"
                    stroke={cor.mentaForte}
                    strokeOpacity={0.6}
                    dot={false}
                    isAnimationActive={false}
                    connectNulls
                    activeDot={false}
                  />
                  <Line
                    dataKey="crianca"
                    stroke={forte}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: forte }}
                    connectNulls
                    isAnimationActive={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      const l = payload?.[0]?.payload as Linha | undefined;
                      if (!active || !l) return null;
                      return (
                        <Box
                          sx={{
                            bgcolor: cor.papel,
                            border: `1px solid ${cor.borda}`,
                            borderRadius: 2,
                            p: 1,
                            fontSize: 12,
                          }}
                        >
                          {l.crianca != null ? (
                            <>
                              <strong>
                                {l.crianca.toLocaleString('pt-BR')} {curva.unidade}
                              </strong>{' '}
                              {percentil(l.percentil)}
                              <br />
                              {dataCurta(l.data)}
                            </>
                          ) : (
                            <>
                              {fmtMeses(l.meses)}: mediana{' '}
                              {l.p50?.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} {curva.unidade}
                            </>
                          )}
                        </Box>
                      );
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </Box>
          {curva.pontos.length > 0 && (
            <Box
              sx={{ mt: 2, bgcolor: cor.papel, border: `1px solid ${cor.borda}`, borderRadius: 3, overflowX: 'auto' }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell align="right">{curva.unidade}</TableCell>
                    <TableCell align="right">Percentil</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...curva.pontos].reverse().map((p) => (
                    <TableRow key={p.data + p.valor}>
                      <TableCell>
                        {dataCurta(p.data)}
                        {p.nascimento && ' (nascimento)'}
                      </TableCell>
                      <TableCell align="right">{p.valor.toLocaleString('pt-BR')}</TableCell>
                      <TableCell align="right">{percentil(p.percentil)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
          {curva.pontos.length === 0 && (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Nenhuma medida ainda: registre uma pesagem no diário.
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
