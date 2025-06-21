import { Paper, Typography, Box, Fab, Icon, Container } from '@mui/material';
import { FinancaProvider } from "../../contexts/FinancaContext";
import { DespesaProvider } from "../../contexts/DespesaContext";
import { Summary } from "./Summary";
import { CadastroModal } from "./CadastroModal";
import { Filtro } from "./Filtro";
import { TabelaTransacao } from "./TabelaTransacao";
import { GraficoBarras } from "./GraficoBarras";
import { useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FilterListIcon from '@mui/icons-material/FilterList';
import TableChartIcon from '@mui/icons-material/TableChart';
import BarChartIcon from '@mui/icons-material/BarChart';

export function GestaoCartao() {
    const [openCadastroModal, setOpenCadastroModal] = useState(false);

    const handleOpenCadastroModal = () => setOpenCadastroModal(true);
    const handleCloseCadastroModal = () => setOpenCadastroModal(false);

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
            component: <TabelaTransacao />,
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
        <FinancaProvider>
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
                                    color: '#ffffff',
                                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                                }}
                            >
                                Gestão de Cartão
                            </Typography>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontWeight: 400,
                                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                                }}
                            >
                                Controle total dos seus cartões e transações
                            </Typography>
                        </Box>

                        {/* Grid de seções */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {sections.map((section, index) => (
                                <Box key={section.title}>
                                    <Paper 
                                        elevation={0}
                                        sx={{
                                            p: { xs: 2, md: 3 },
                                            borderRadius: 1,
                                            background: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(20px)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            position: 'relative',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                                            },
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '3px',
                                                background: section.color,
                                            },
                                        }}
                                        className="fade-in-up"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        {/* Header da seção */}
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            mb: 3,
                                            gap: 2
                                        }}>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                width: 48,
                                                height: 48,
                                                borderRadius: 2,
                                                background: section.color,
                                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.25)',
                                            }}>
                                                <Icon sx={{ color: '#ffffff', fontSize: 24 }}>
                                                    {section.icon}
                                                </Icon>
                                            </Box>
                                            
                                            <Box>
                                                <Typography 
                                                    variant="h5" 
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        color: '#2c3e50',
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    {section.title}
                                                </Typography>
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        color: '#7f8c8d',
                                                        fontSize: '0.875rem',
                                                    }}
                                                >
                                                    {section.description}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Conteúdo da seção */}
                                        <Box>
                                            {section.component}
                                        </Box>
                                    </Paper>
                                </Box>
                            ))}
                        </Box>

                        {/* Modal de Cadastro */}
                        <CadastroModal 
                            open={openCadastroModal}
                            onClose={handleCloseCadastroModal}
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
                    </Container>
                </Box>
            </DespesaProvider>
        </FinancaProvider>
    );
}


