import { useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { GestaoCartaoContext } from '../../../contexts/GestaoCartaoContext';
import { formatCurrency } from '../../../functions/global';
import { colors } from '../../../styles/colors';

const chartBoxSx = {
  width: '100%',
  display: 'block' as const,
  background: colors.bg.paper,
  border: `1px solid ${colors.border.default}`,
  borderRadius: 2,
  p: 2,
};

const tooltipStyle = {
  background: colors.chart.tooltipBg,
  color: colors.text.primary,
  border: `1px solid ${colors.chart.tooltipBorder}`,
  borderRadius: 8,
};

const renderCustomLabel = (props: any) => {
    const { x, y, width, value } = props;
    return (
        <text x={x + width / 2} y={y - 10} fill={colors.text.secondary} textAnchor="middle" dominantBaseline="middle" fontSize={12}>
            {formatCurrency(value)}
        </text>
    );
};

export function GraficoBarras() {
    const { ultimosFiltros, dadosGrafico, loadingGrafico } = useContext(GestaoCartaoContext);

    if (!ultimosFiltros.ano || !ultimosFiltros.pessoa || ultimosFiltros.pessoa === 'TODOS') {
        return (
            <Typography sx={{ color: colors.text.secondary }}>
                Selecione ano e pessoa para visualizar o gráfico.
            </Typography>
        );
    }

    if (dadosGrafico.length === 0) {
        return (
            <>
                <Typography variant="h6" gutterBottom sx={{ color: colors.text.primary, fontWeight: 600, px: 2, pt: 2 }}>
                    Despesas Mensais - {ultimosFiltros.pessoa}
                </Typography>
                <Typography sx={{ color: colors.text.secondary }}>
                    Nenhum dado disponível para o período selecionado.
                </Typography>
            </>
        );
    }

    return (
        <>
            <Typography variant="h6" gutterBottom sx={{ color: colors.text.primary, fontWeight: 600, px: 2, pt: 2 }}>
                Despesas Mensais - {ultimosFiltros.pessoa}
            </Typography>
            <Box sx={{ ...chartBoxSx, height: 360 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={dadosGrafico}
                        margin={{
                            top: 60,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.grid} />
                        <XAxis dataKey="mes" tick={{ fill: colors.text.secondary, fontSize: 12 }} />
                        <YAxis 
                            tickFormatter={(value: number) => formatCurrency(value)}
                            tick={{ fill: colors.text.secondary, fontSize: 12 }}
                        />
                        <Tooltip 
                            formatter={(value: number) => [formatCurrency(value), "Valor"]}
                            labelFormatter={(label: string) => `Mês: ${label}`}
                            contentStyle={tooltipStyle}
                        />
                        <Legend wrapperStyle={{ color: colors.text.secondary }} />
                        <Bar 
                            dataKey="valorMes" 
                            name="Valor Mensal" 
                            fill={colors.chart.blue}
                            radius={[4, 4, 0, 0]}
                        >
                            <LabelList 
                                dataKey="valorMes" 
                                position="top" 
                                content={renderCustomLabel}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>
            {loadingGrafico && (
                <Typography align="center" sx={{ mt: 2, color: colors.text.secondary }}>
                    Carregando dados do gráfico...
                </Typography>
            )}
        </>
    );
} 