import { useContext } from "react";
import { FormatNumber } from '../../../functions/global';
import { DespesaContext } from "../../../contexts/DespesaContext";
import { Box, Typography, Icon } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaymentIcon from '@mui/icons-material/Payment';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { Card } from '../../../components/Card';
import { LoadingCard } from '../../../components/ui/LoadingCard';

export function Summary() {
    const { despesa, loading } = useContext(DespesaContext);

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

    if (loading) {
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
                <LoadingCard title="Total" variant="compact" />
                <LoadingCard title="Próximo Mês" variant="compact" />
                <LoadingCard title="Valor Saindo" variant="compact" />
                <LoadingCard title="Parcelas Saindo" variant="compact" />
                <LoadingCard title="Total Saindo" variant="compact" />
            </Box>
        );
    }

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
                <Card
                    key={index}
                    title={item.title}
                    description={item.description}
                    icon={item.icon}
                    gradient={item.gradient}
                    className="fade-in-up"
                >
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
                        {/* Indicador de tendência */}
                        <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {item.trend === "up" ? (
                                <TrendingUpIcon sx={{ color: '#4facfe', fontSize: 14, transform: 'rotate(-45deg)' }} />
                            ) : (
                                <TrendingDownIcon sx={{ color: '#ff6b6b', fontSize: 14, transform: 'rotate(45deg)' }} />
                            )}
                        </Box>
                    </Box>
                </Card>
            ))}
        </Box>
    );
}