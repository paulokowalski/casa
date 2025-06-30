import { Typography, Box, Fab, Container } from '@mui/material';
import { GestaoCartaoProvider } from "../../contexts/GestaoCartaoContext";
import { DespesaProvider } from "../../contexts/DespesaContext";
import { Summary } from "./Summary";
import { CadastroModal } from "./CadastroModal";
import { Filtro } from "./Filtro";
import { TabelaTransacao } from "./TabelaTransacao";
import { GraficoBarras } from "./GraficoBarras";
import { useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import { Card } from '../../components/Card';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FilterListIcon from '@mui/icons-material/FilterList';
import TableChartIcon from '@mui/icons-material/TableChart';
import BarChartIcon from '@mui/icons-material/BarChart';

export function GestaoCartao() {
    const [openCadastroModal, setOpenCadastroModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [compraParaEditar, setCompraParaEditar] = useState<any | null>(null);

    const handleOpenCadastroModal = () => {
        setCompraParaEditar(null);
        setOpenCadastroModal(true);
    };
    const handleCloseCadastroModal = () => {
        setOpenCadastroModal(false);
        setCompraParaEditar(null);
    };

    // Ao cadastrar ou editar com sucesso
    const handleCadastroSuccess = () => {
        setOpenCadastroModal(false);
        setCompraParaEditar(null);
        setShowSuccess(true);
    };

    const handleCloseSuccess = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setShowSuccess(false);
    };

    const handleEditCompra = (compra: any) => {
        setCompraParaEditar(compra);
        setOpenCadastroModal(true);
    };

    const sections = [
        {
            title: "Resumo Financeiro",
            description: "Visão geral dos valores e tendências",
            icon: <TrendingUpIcon />,
            component: <Summary />,
            color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        },
        {
            title: "Filtros",
            description: "Configure os filtros de busca",
            icon: <FilterListIcon />,
            component: <Filtro />,
            color: "linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)"
        },
        {
            title: "Transações",
            description: "Lista de todas as transações",
            icon: <TableChartIcon />,
            component: <TabelaTransacao onEditCompra={handleEditCompra} />,
            color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        },
        {
            title: "Gráficos",
            description: "Análise visual dos dados",
            icon: <BarChartIcon />,
            component: <GraficoBarras />,
            color: "linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)"
        }
    ];

    return (
        <GestaoCartaoProvider>
            <DespesaProvider>
                <Box sx={{ width: '100%', minHeight: '100vh' }}>
                    <Container 
                        maxWidth="xl" 
                        sx={{ 
                            py: { xs: 2, md: 4 },
                            px: { xs: 1, sm: 2, md: 0 },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            width: '100%',
                            maxWidth: '100vw',
                            boxSizing: 'border-box',
                        }}
                    >
                        {/* Header da página */}
                        <Box sx={{ mb: 4, textAlign: 'center' }} className="fade-in">
                            <Typography 
                                variant="h3" 
                                sx={{ 
                                    fontWeight: 800,
                                    mb: 1,
                                    color: '#764ba2',
                                    textShadow: '0 4px 16px rgba(39,26,69,0.18)',
                                }}
                            >
                                Gestão de Cartão
                            </Typography>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    color: '#764ba2',
                                    fontWeight: 400,
                                    textShadow: '0 2px 8px rgba(39,26,69,0.18)',
                                }}
                            >
                                Controle total dos seus cartões e transações
                            </Typography>
                        </Box>

                        {/* Grid de seções */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {sections.map((section, index) => (
                                <Box key={section.title}>
                                    <Card
                                        title={section.title}
                                        description={section.description}
                                        icon={section.icon}
                                        gradient={section.color}
                                        className="fade-in-up"
                                    >
                                        <Box>
                                            {section.component}
                                        </Box>
                                    </Card>
                                </Box>
                            ))}
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
                        <Box sx={{ 
                            position: 'fixed', 
                            bottom: 24, 
                            right: 24,
                            zIndex: 1000,
                        }}>
                            <Fab 
                                color="primary" 
                                aria-label="adicionar transação"
                                onClick={handleOpenCadastroModal}
                                sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                                    width: 56,
                                    height: 56,
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                        transform: 'scale(1.05)',
                                        boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                                    },
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                            >
                                <AddIcon />
                            </Fab>
                        </Box>

                        {/* Snackbar de sucesso */}
                        <Snackbar
                            open={showSuccess}
                            autoHideDuration={3000}
                            onClose={handleCloseSuccess}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        >
                            <MuiAlert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
                                Transação cadastrada com sucesso!
                            </MuiAlert>
                        </Snackbar>
                    </Container>
                </Box>
            </DespesaProvider>
        </GestaoCartaoProvider>
    );
}


