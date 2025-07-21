import { Typography, Box, Container, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TableChartIcon from '@mui/icons-material/TableChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import { GestaoCartaoProvider } from "../../contexts/GestaoCartaoContext";
import { DespesaProvider } from "../../contexts/DespesaContext";
import { Summary } from "./Summary";
import { CadastroModal } from "./CadastroModal";
import { Filtro } from "./Filtro";
import { TabelaTransacao } from "./TabelaTransacao";
import { GraficoBarras } from "./GraficoBarras";
import { GraficoPorCartao } from './GraficoBarras/GraficoPorCartao';
import { useState, useEffect } from "react";
import { Card } from '../../components/Card';
import { Alert as CustomAlert } from '../../components/ui/Alert';
import React from 'react';
import { Theme } from '@mui/material/styles';

export function GestaoCartao() {
    const [openCadastroModal, setOpenCadastroModal] = useState(false);
    const [compraParaEditar, setCompraParaEditar] = useState<any | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [itemParaExcluir, setItemParaExcluir] = useState<any | null>(null);

    const handleOpenCadastroModal = () => {
        setCompraParaEditar(null);
        setOpenCadastroModal(true);
    };
    const handleCloseCadastroModal = () => {
        setOpenCadastroModal(false);
        setCompraParaEditar(null);
    };
    const handleCadastroSuccess = () => {
        setOpenCadastroModal(false);
        setCompraParaEditar(null);
        setSuccessMessage('Transação cadastrada com sucesso!');
        setShowSuccess(true);
    };
    const handleExclusaoSuccess = () => {
        setSuccessMessage('Transação excluída com sucesso!');
        setShowSuccess(true);
    };
    const handleEditCompra = (compra: any) => {
        setCompraParaEditar(compra);
        setOpenCadastroModal(true);
    };
    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    const sections = [
        {
            title: 'Resumo Financeiro',
            icon: <TrendingUpIcon />, 
            component: <Summary />, 
            color: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        },
        {
            title: 'Transações',
            icon: <TableChartIcon />, 
            component: <TabelaTransacao onEditCompra={handleEditCompra} itemParaExcluir={itemParaExcluir} setItemParaExcluir={setItemParaExcluir} handleExclusaoSuccess={handleExclusaoSuccess} />, 
            color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        },
        {
            title: 'Gráficos',
            icon: <BarChartIcon />, 
            component: (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    <Box sx={{ flex: 1 }}><GraficoBarras /></Box>
                    <Box sx={{ flex: 1 }}><GraficoPorCartao /></Box>
                </Box>
            ),
            color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        },
    ];

    return (
        <GestaoCartaoProvider>
            <DespesaProvider>
                <Box sx={{ width: '100%', minHeight: '100vh', pb: 6, boxSizing: 'border-box', px: { xs: 1, sm: 3, md: 6 }, mt: 10 }}>
                    {/* Header da página */}
                    <Box sx={{ mb: 2, textAlign: 'center', width: '100%' }}>
                        <Typography 
                            variant="h3" 
                            sx={{ 
                                fontWeight: 800,
                                mb: 1,
                                color: '#f5f6fa',
                                textShadow: '0 4px 16px rgba(139, 92, 246, 0.3)',
                            }}
                        >
                            Gestão de Cartão
                        </Typography>
                    </Box>

                    {/* Filtros em card, logo abaixo do título */}
                    <Card 
                        sx={{ mb: 3, borderRadius: 0.5, background: (theme: Theme) => theme.palette.background.paper, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', minHeight: 80, width: '100%', maxWidth: '100%', px: { xs: 1, sm: 4 } }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, flexWrap: { xs: 'nowrap', sm: 'wrap' }, justifyContent: 'stretch', alignItems: 'center', width: '100%', py: 1 }}>
                            <Box sx={{ flex: 1 }}>
                                <Filtro />
                            </Box>
                        </Box>
                    </Card>

                    {/* Grid de seções lado a lado em telas médias/grandes */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 3,
                        width: '100%',
                    }}>
                        {/* Coluna esquerda: Summary + Tabela */}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Card
                                gradient={'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'}
                                sx={{
                                    mb: 3,
                                    borderRadius: 0.5,
                                    background: (theme: Theme) => theme.palette.background.paper,
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                    width: '100%',
                                    maxWidth: '100%',
                                    px: { xs: 1, sm: 4 },
                                }}
                            >
                                <Summary />
                            </Card>
                            <Card
                                gradient={'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}
                                sx={{
                                    mb: 3,
                                    borderRadius: 0.5,
                                    background: (theme: Theme) => theme.palette.background.paper,
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                    width: '100%',
                                    maxWidth: '100%',
                                    px: { xs: 1, sm: 4 },
                                }}
                            >
                                <TabelaTransacao onEditCompra={handleEditCompra} itemParaExcluir={itemParaExcluir} setItemParaExcluir={setItemParaExcluir} handleExclusaoSuccess={handleExclusaoSuccess} />
                            </Card>
                        </Box>
                        {/* Coluna direita: Gráficos */}
                        <Box sx={{ flex: 1, minWidth: 350, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Card
                                gradient={'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}
                                sx={{
                                    mb: 3,
                                    borderRadius: 0.5,
                                    background: (theme: Theme) => theme.palette.background.paper,
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                    width: '100%',
                                    maxWidth: '100%',
                                    px: 0,
                                }}
                            >
                                <GraficoBarras />
                            </Card>
                            <Card
                                gradient={'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}
                                sx={{
                                    mb: 3,
                                    borderRadius: 0.5,
                                    background: (theme: Theme) => theme.palette.background.paper,
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                    width: '100%',
                                    maxWidth: '100%',
                                    px: 0,
                                }}
                            >
                                <GraficoPorCartao />
                            </Card>
                        </Box>
                    </Box>

                    {/* Modal de Cadastro */}
                    <CadastroModal 
                        open={openCadastroModal}
                        onClose={handleCloseCadastroModal}
                        onSuccess={handleCadastroSuccess}
                        onEdit={handleCadastroSuccess}
                        compra={compraParaEditar}
                    />

                    {/* FAB Moderno */}
                    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
                        <Fab
                            color="primary"
                            aria-label="adicionar transação"
                            onClick={handleOpenCadastroModal}
                            sx={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                                    boxShadow: '0 12px 35px rgba(139, 92, 246, 0.5)',
                                },
                            }}
                        >
                            <AddIcon />
                        </Fab>
                    </Box>

                    {/* Alerta fixo de feedback, sem animação */}
                    {showSuccess && (
                        <Box sx={{ position: 'fixed', top: 16, left: 0, right: 0, zIndex: 2000, display: 'flex', justifyContent: 'center' }}>
                            <CustomAlert onClose={() => setShowSuccess(false)} severity="success">
                                {successMessage}
                            </CustomAlert>
                        </Box>
                    )}
                </Box>
            </DespesaProvider>
        </GestaoCartaoProvider>
    );
}


