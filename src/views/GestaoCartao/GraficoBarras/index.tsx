import { useEffect, useState, useContext } from 'react';
import { api } from '../../../services/api';
import { API_URLS } from '../../../config/urls';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Box, Typography } from '@mui/material';
import { formatCurrency } from '../../../functions/global';
import { GestaoCartaoContext } from '../../../contexts/GestaoCartaoContext';

interface DadosGrafico {
    mes: string;
    valorMes: number;
}

interface ValorMesAPI {
    valorMes: number;
    valorProximoMes: number;
    valorSaindo: number;
    valorParcelaSaindo: number;
    valorSaindoTotal: number;
}

interface RespostaAPI {
    pessoa: string;
    ano: string;
    despesasPorMes: Record<string, ValorMesAPI>;
}

const renderCustomLabel = (props: any) => {
    const { x, y, width, value } = props;
    return (
        <text 
            x={x + width / 2} 
            y={y - 10} 
            fill="#f5f6fa"
            textAnchor="middle"
            fontSize="12"
        >
            {formatCurrency(value)}
        </text>
    );
};

export function GraficoBarras() {
    const [dados, setDados] = useState<DadosGrafico[]>([]);
    const { ultimosFiltros } = useContext(GestaoCartaoContext);

    useEffect(() => {
        if (
            ultimosFiltros.ano &&
            ultimosFiltros.pessoa &&
            ultimosFiltros.pessoa !== 'TODOS'
        ) {
            api.get(API_URLS.DESPESA_SEM_MES(ultimosFiltros.ano, ultimosFiltros.pessoa))
                .then(response => {
                    const respostaAPI = response.data as RespostaAPI;
                    if (respostaAPI.despesasPorMes) {
                        const dadosFormatados = Object.entries(respostaAPI.despesasPorMes)
                            .map(([chave, valorObj]) => ({
                                mes: chave.padStart(2, '0'),
                                valorMes: valorObj?.valorMes ?? 0
                            }))
                            .sort((a, b) => parseInt(a.mes) - parseInt(b.mes));
                        setDados(dadosFormatados);
                    } else {
                        setDados([]);
                    }
                })
                .catch(() => {
                    setDados([]);
                });
        } else {
            setDados([]);
        }
    }, [ultimosFiltros]);

    if (!ultimosFiltros.ano || !ultimosFiltros.pessoa || ultimosFiltros.pessoa === 'TODOS') {
        return (
            <Typography sx={{ color: '#a0aec0' }}>
                Selecione ano e pessoa para visualizar o gráfico.
            </Typography>
        );
    }

    if (dados.length === 0) {
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
                        data={dados}
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
        </>
    );
} 