import { useContext } from "react";
import { FormatNumber } from '../../../functions/global';
import { DespesaContext } from "../../../contexts/DespesaContext";
import { Box, Paper, Typography, Icon } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaymentIcon from '@mui/icons-material/Payment';
import CreditCardIcon from '@mui/icons-material/CreditCard';

export function Summary() {
    const { despesa } = useContext(DespesaContext);

    const summaryItems = [
        {
            title: "Total",
            value: FormatNumber(despesa?.valorMes as number),
            color: "#4facfe",
            gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            icon: <AccountBalanceWalletIcon />,
            trend: "up",
            description: "Valor total do mês"
        },
        {
            title: "Próximo Mês",
            value: FormatNumber(despesa?.valorProximoMes as number),
            color: "#36d1dc",
            gradient: "linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)",
            icon: <CalendarTodayIcon />,
            trend: "up",
            description: "Projeção para o próximo mês"
        },
        {
            title: "Valor Saindo",
            value: FormatNumber(despesa?.valorSaindo as number),
            color: "#ff6b6b",
            gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
            icon: <TrendingDownIcon />,
            trend: "down",
            description: "Valor saindo"
        },
        {
            title: "Parcelas Saindo",
            value: FormatNumber(despesa?.valorParcelaSaindo as number),
            color: "#feca57",
            gradient: "linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)",
            icon: <PaymentIcon />,
            trend: "down",
            description: "Valor parcela saindo"
        },
        {
            title: "Total Saindo",
            value: FormatNumber(despesa?.valorSaindoTotal as number),
            color: "#e91e63",
            gradient: "linear-gradient(135deg, #e91e63 0%, #9c27b0 100%)",
            icon: <CreditCardIcon />,
            trend: "down",
            description: "Total de saídas"
        }
    ];

    return (
        <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(5, 1fr)'
            },
            gap: { xs: 2, md: 3 },
            width: '100%',
        }}>
            {summaryItems.map((item, index) => (
                <Paper 
                    key={index}
                    elevation={0}
                    sx={{
                        p: { xs: 2, md: 2.5 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        borderRadius: 1,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                        },
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: item.gradient,
                        },
                    }}
                    className="fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    {/* Header do Card */}
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        width: '100%',
                        mb: 2
                    }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: item.gradient,
                            boxShadow: `0 4px 15px ${item.color}30`,
                            mb: 1
                        }}>
                            <Icon sx={{ color: '#ffffff', fontSize: 20 }}>
                                {item.icon}
                            </Icon>
                        </Box>
                    </Box>

                    {/* Conteúdo do Card */}
                    <Box sx={{ width: '100%' }}>
                        <Typography 
                            variant="h4" 
                            component="p" 
                            sx={{ 
                                color: item.color,
                                fontWeight: 700,
                                mb: 1,
                                fontSize: { xs: '1.25rem', md: '1.5rem' },
                                background: item.gradient,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            {item.value}
                        </Typography>
                        
                        <Typography 
                            variant="h6" 
                            component="h2" 
                            sx={{ 
                                color: '#2c3e50',
                                fontWeight: 600,
                                mb: 1,
                                fontSize: { xs: '0.875rem', md: '1rem' },
                            }}
                        >
                            {item.title}
                        </Typography>
                        
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: '#7f8c8d',
                                fontSize: '0.75rem',
                                lineHeight: 1.4,
                            }}
                        >
                            {item.description}
                        </Typography>
                    </Box>

                    {/* Indicador de tendência */}
                    <Box sx={{ 
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                    }}>
                        {item.trend === "up" ? (
                            <TrendingUpIcon sx={{ 
                                color: '#4facfe', 
                                fontSize: 14,
                                transform: 'rotate(-45deg)',
                            }} />
                        ) : (
                            <TrendingDownIcon sx={{ 
                                color: '#ff6b6b', 
                                fontSize: 14,
                                transform: 'rotate(45deg)',
                            }} />
                        )}
                    </Box>
                </Paper>
            ))}
        </Box>
    );
}