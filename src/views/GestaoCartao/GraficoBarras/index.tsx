import { useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { GestaoCartaoContext } from '../../../contexts/GestaoCartaoContext';
import { formatCurrency } from '../../../functions/global';

const renderCustomLabel = (props: any) => {
    const { x, y, width, value } = props;
    return (
        <text x={x + width / 2} y={y - 10} fill="#f5f6fa" textAnchor="middle" dominantBaseline="middle" fontSize={12}>
            {formatCurrency(value)}
        </text>
    );
};

export function GraficoBarras() {
    const { ultimosFiltros, dadosGrafico, loadingGrafico } = useContext(GestaoCartaoContext);

    if (!ultimosFiltros.ano || !ultimosFiltros.pessoa || ultimosFiltros.pessoa === 'TODOS') {
        return (
            <Typography sx={{ color: '#a0aec0' }}>
                Selecione ano e pessoa para visualizar o gráfico.
            </Typography>
        );
    }

    if (dadosGrafico.length === 0) {
        return (
            <>
                <Typography variant="h6" gutterBottom sx={{ color: '#f5f6fa' }}>
                    Despesas Mensais - {ultimosFiltros.pessoa}
                </Typography>
                <Typography sx={{ color: '#a0aec0' }}>
                    Nenhum dado disponível para o período selecionado.
                </Typography>
            </>
        );
    }

    return (
        <>
            <Typography variant="h6" gutterBottom sx={{ color: '#f5f6fa' }}>
                Despesas Mensais - {ultimosFiltros.pessoa}
            </Typography>
            <Box sx={{ width: '100%', height: 360, display: 'block', background: '#23263a', borderRadius: 2, p: 2 }}>
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
                        <CartesianGrid strokeDasharray="3 3" stroke="#444857" />
                        <XAxis dataKey="mes" tick={{ fill: '#f5f6fa' }} />
                        <YAxis 
                            tickFormatter={(value: number) => formatCurrency(value)}
                            tick={{ fill: '#f5f6fa' }}
                        />
                        <Tooltip 
                            formatter={(value: number) => [formatCurrency(value), "Valor"]}
                            labelFormatter={(label: string) => `Mês: ${label}`}
                            contentStyle={{ background: '#181a20', color: '#f5f6fa', border: '1px solid #6366f1' }}
                        />
                        <Legend wrapperStyle={{ color: '#f5f6fa' }} />
                        <Bar 
                            dataKey="valorMes" 
                            name="Valor Mensal" 
                            fill="#8b5cf6"
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
                <Typography align="center" sx={{ mt: 2, color: '#f5f6fa' }}>
                    Carregando dados do gráfico...
                </Typography>
            )}
        </>
    );
} 