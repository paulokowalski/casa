import { useEffect, useState, useContext } from 'react';
import { api } from '../../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Box, Typography } from '@mui/material';
import { FormatNumber } from '../../../functions/global';
import { FinancaContext } from '../../../contexts/FinancaContext';

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
            fill="#666"
            textAnchor="middle"
            fontSize="12"
        >
            {FormatNumber(value)}
        </text>
    );
};

export function GraficoBarras() {
    const [dados, setDados] = useState<DadosGrafico[]>([]);
    const { ultimosFiltros } = useContext(FinancaContext);

    useEffect(() => {
        if (ultimosFiltros.ano && ultimosFiltros.pessoa && ultimosFiltros.pessoa !== 'TODOS') {
            api.get(`/v1/despesa/${ultimosFiltros.ano}/${ultimosFiltros.pessoa}`)
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
                .catch(error => {
                    console.error('Erro ao carregar dados:', error);
                    setDados([]);
                });
        }
    }, [ultimosFiltros]);

    if (!ultimosFiltros.ano || !ultimosFiltros.pessoa || ultimosFiltros.pessoa === 'TODOS') {
        return null;
    }

    if (dados.length === 0) {
        return (
            <>
                <Typography variant="h6" gutterBottom>
                    Despesas Mensais - {ultimosFiltros.pessoa}
                </Typography>
                <Typography color="text.secondary">
                    Nenhum dado disponível para o período selecionado.
                </Typography>
            </>
        );
    }

    return (
        <>
            <Typography variant="h6" gutterBottom>
                Despesas Mensais - {ultimosFiltros.pessoa}
            </Typography>
            <Box sx={{ width: '100%', height: { xs: 220, md: 300 }, overflowX: { xs: 'auto', md: 'visible' }, p: { xs: 1, md: 0 } }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={dados}
                        margin={{
                            top: 30,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis 
                            tickFormatter={(value: number) => FormatNumber(value)}
                        />
                        <Tooltip 
                            formatter={(value: number) => [FormatNumber(value), "Valor"]}
                            labelFormatter={(label: string) => `Mês: ${label}`}
                        />
                        <Legend />
                        <Bar 
                            dataKey="valorMes" 
                            name="Valor Mensal" 
                            fill="#8884d8"
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