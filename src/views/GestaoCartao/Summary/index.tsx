import { useContext } from "react";
import { formatCurrency } from '../../../functions/global';
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
            value: formatCurrency(despesa?.valorMes as number),
            color: "#4facfe",
            gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            icon: <AccountBalanceWalletIcon />,
            trend: "up",
            description: "Valor total do mês"
        },
        {
            title: "Próximo Mês",
            value: formatCurrency(despesa?.valorProximoMes as number),
            color: "#8b5cf6",
            gradient: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
            icon: <CalendarTodayIcon />,
            trend: "up",
            description: "Projeção para o próximo mês"
        },
        {
            title: "Valor Saindo",
            value: formatCurrency(despesa?.valorSaindo as number),
            color: "#ef4444",
            gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            icon: <TrendingDownIcon />,
            trend: "down",
            description: "Valor saindo"
        },
        {
            title: "Parcelas Saindo",
            value: formatCurrency(despesa?.valorParcelaSaindo as number),
            color: "#f59e0b",
            gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            icon: <PaymentIcon />,
            trend: "down",
            description: "Valor parcela saindo"
        },
        {
            title: "Total Saindo",
            value: formatCurrency(despesa?.valorSaindoTotal as number),
            color: "#ec4899",
            gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
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
                    gradient={item.gradient}
                    className="fade-in-up"
                >
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <span style={{ display: 'flex', alignItems: 'center', color: item.color, fontSize: 18 }}>{item.icon}</span>
                            <Typography variant="subtitle2" sx={{ color: item.color, fontWeight: 500, fontSize: '0.95rem', opacity: 0.85 }}>
                                {item.title}
                            </Typography>
                        </Box>
                        <Typography 
                            variant="h4" 
                            component="p" 
                            sx={{ 
                                color: item.color,
                                fontWeight: 700,
                                fontSize: { xs: '1.35rem', md: '1.7rem' },
                                background: item.gradient,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                mb: 0,
                            }}
                        >
                            {item.value}
                        </Typography>
                    </Box>
                </Card>
            ))}
        </Box>
    );
}