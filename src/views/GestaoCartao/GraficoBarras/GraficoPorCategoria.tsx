import { useContext, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { GestaoCartaoContext } from '../../../contexts/GestaoCartaoContext';
import { formatCurrency } from '../../../functions/global';

const renderCustomLabel = (props: any) => {
    const { x, y, width, value } = props;
    return (
        <text x={x + width / 2} y={y - 10} fill="#f5f6fa" textAnchor="middle" dominantBaseline="middle" fontSize={14}>
            {formatCurrency(value)}
        </text>
    );
};

interface GraficoPorCategoriaProps {
    categoriaSelecionada?: string | null;
    onToggleCategoria?: (categoria?: string | null) => void;
}

export function GraficoPorCategoria({ categoriaSelecionada, onToggleCategoria }: Readonly<GraficoPorCategoriaProps>) {
    const { compras, ultimosFiltros, loading } = useContext(GestaoCartaoContext);

    const dadosPorCategoria = useMemo(() => {
        if (!compras || compras.length === 0) return [];

        const categoriasMap = new Map<string, number>();

        compras.forEach(compra => {
            const categoria = compra.categoria || 'Sem categoria';
            const valorAtual = categoriasMap.get(categoria) || 0;
            categoriasMap.set(categoria, valorAtual + compra.valorParcela);
        });

        return Array.from(categoriasMap.entries())
            .map(([categoria, valorParcela]) => ({
                categoria,
                valorParcela
            }))
            .sort((a, b) => b.valorParcela - a.valorParcela); // Ordena por valor decrescente
    }, [compras]);

    if (!ultimosFiltros.ano || !ultimosFiltros.mes) {
        return (
            <Typography sx={{ color: '#a0aec0' }}>
                Selecione ano e mês para visualizar o gráfico por categoria.
            </Typography>
        );
    }

    if (dadosPorCategoria.length === 0) {
        return (
            <>
                <Typography variant="h6" gutterBottom sx={{ color: '#f5f6fa' }}>
                    Gastos por Categoria - {ultimosFiltros.mes}/{ultimosFiltros.ano}
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
                Gastos por Categoria - {ultimosFiltros.mes}/{ultimosFiltros.ano}
            </Typography>
            <Box sx={{ width: '100%', height: 430, display: 'block', background: '#23263a', borderRadius: 2, p: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={dadosPorCategoria}
                        margin={{
                            top: 60,
                            right: 30,
                            left: 20,
                            bottom: 90,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444857" />
                        <XAxis 
                            dataKey="categoria"
                            tick={{ fill: '#f5f6fa' }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis 
                            tickFormatter={(value: number) => formatCurrency(value)}
                            tick={{ fill: '#f5f6fa' }}
                        />
                        <Tooltip 
                            formatter={(value: number) => [formatCurrency(value), "Valor Parcela"]}
                            labelFormatter={(label: string) => `Categoria: ${label}`}
                            contentStyle={{ background: '#181a20', color: '#f5f6fa', border: '1px solid #6366f1' }}
                        />
                        <Legend wrapperStyle={{ color: '#f5f6fa' }} />
                        <Bar 
                            dataKey="valorParcela" 
                            name="Valor Parcela" 
                            fill="#8b5cf6"
                            radius={[4, 4, 0, 0]}
                            onClick={(data) => onToggleCategoria && onToggleCategoria(data?.categoria)}
                        >
                            <LabelList 
                                dataKey="valorParcela" 
                                position="top" 
                                content={renderCustomLabel}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>
            {categoriaSelecionada && (
                <Typography align="center" sx={{ mt: 1, color: '#a0aec0', cursor: 'pointer' }} onClick={() => onToggleCategoria && onToggleCategoria(null)}>
                    Filtrando por categoria: <strong>{categoriaSelecionada}</strong> (clique para limpar)
                </Typography>
            )}
            {loading && (
                <Typography align="center" sx={{ mt: 2, color: '#f5f6fa' }}>
                    Carregando dados do gráfico...
                </Typography>
            )}
        </>
    );
}
