import { Typography, Box, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { GestaoCartaoProvider } from "../../contexts/GestaoCartaoContext";
import { Summary } from "./Summary";
import { CadastroModal } from "./CadastroModal";
import { Filtro } from "./Filtro";
import { TabelaTransacao } from "./TabelaTransacao";
import { GraficoBarras } from "./GraficoBarras";
import { GraficoPorCartao } from './GraficoBarras/GraficoPorCartao';
import { GraficoPorCategoria } from './GraficoBarras/GraficoPorCategoria';
import { useState, useEffect } from "react";
import { Card } from '../../components/Card';
import { Alert as CustomAlert } from '../../components/ui/Alert';
import { Theme } from '@mui/material/styles';
import { colors } from '../../styles/colors';

export function GestaoCartao() {
    const [openCadastroModal, setOpenCadastroModal] = useState(false);
    const [compraParaEditar, setCompraParaEditar] = useState<any | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [itemParaExcluir, setItemParaExcluir] = useState<any | null>(null);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);

    const handleToggleCategoria = (categoria?: string | null) => {
        if (!categoria) {
            setCategoriaSelecionada(null);
            return;
        }
        setCategoriaSelecionada(prev => (prev === categoria ? null : categoria));
    };

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

    return (
        <GestaoCartaoProvider>
            <Box sx={{ width: '100%', minHeight: '100vh', pb: 6, boxSizing: 'border-box' }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ color: colors.text.secondary }}>
                        Controle de despesas e parcelamentos
                    </Typography>
                </Box>

                <Card
                    sx={{ mb: 3, background: (theme: Theme) => theme.palette.background.paper, minHeight: 80, width: '100%', maxWidth: '100%', px: { xs: 1, sm: 3 } }}
                >
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, flexWrap: { xs: 'nowrap', sm: 'wrap' }, justifyContent: 'stretch', alignItems: 'center', width: '100%', py: 1 }}>
                        <Box sx={{ flex: 1 }}>
                            <Filtro />
                        </Box>
                    </Box>
                </Card>

                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 3,
                    width: '100%',
                }}>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Card
                            gradient={colors.primary.light}
                            sx={{
                                mb: 3,
                                background: (theme: Theme) => theme.palette.background.paper,
                                width: '100%',
                                maxWidth: '100%',
                                px: { xs: 1, sm: 3 },
                            }}
                        >
                            <Summary />
                        </Card>
                        <Card
                            gradient={colors.chart.cyan}
                            sx={{
                                mb: 3,
                                background: (theme: Theme) => theme.palette.background.paper,
                                width: '100%',
                                maxWidth: '100%',
                                px: { xs: 1, sm: 3 },
                            }}
                        >
                            <TabelaTransacao
                                onEditCompra={handleEditCompra}
                                itemParaExcluir={itemParaExcluir}
                                setItemParaExcluir={setItemParaExcluir}
                                handleExclusaoSuccess={handleExclusaoSuccess}
                                categoriaSelecionada={categoriaSelecionada}
                                onToggleCategoria={handleToggleCategoria}
                            />
                        </Card>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 350, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Card
                            gradient={colors.chart.amber}
                            sx={{
                                mb: 3,
                                background: (theme: Theme) => theme.palette.background.paper,
                                width: '100%',
                                maxWidth: '100%',
                                px: 0,
                            }}
                        >
                            <GraficoBarras />
                        </Card>
                        <Card
                            gradient={colors.chart.amber}
                            sx={{
                                mb: 3,
                                background: (theme: Theme) => theme.palette.background.paper,
                                width: '100%',
                                maxWidth: '100%',
                                px: 0,
                            }}
                        >
                            <GraficoPorCartao />
                        </Card>
                    </Box>
                </Box>

                <Card
                    gradient={colors.semantic.success}
                    sx={{
                        mb: 3,
                        background: (theme: Theme) => theme.palette.background.paper,
                        width: '100%',
                        maxWidth: '100%',
                        px: 0,
                    }}
                >
                    <GraficoPorCategoria
                        categoriaSelecionada={categoriaSelecionada}
                        onToggleCategoria={handleToggleCategoria}
                    />
                </Card>

                <CadastroModal 
                    open={openCadastroModal}
                    onClose={handleCloseCadastroModal}
                    onSuccess={handleCadastroSuccess}
                    onEdit={handleCadastroSuccess}
                    compra={compraParaEditar}
                />

                <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
                    <Fab
                        color="primary"
                        aria-label="adicionar transação"
                        onClick={handleOpenCadastroModal}
                    >
                        <AddIcon />
                    </Fab>
                </Box>

                {showSuccess && (
                    <Box sx={{ position: 'fixed', top: 16, left: 0, right: 0, zIndex: 2000, display: 'flex', justifyContent: 'center' }}>
                        <CustomAlert onClose={() => setShowSuccess(false)} severity="success">
                            {successMessage}
                        </CustomAlert>
                    </Box>
                )}
            </Box>
        </GestaoCartaoProvider>
    );
}


